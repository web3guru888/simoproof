/**
 * SimoProof MCP Server — exposes 6 tools for KeeperHub automation.
 * Also serves as the HTTP endpoint KeeperHub calls for workflow steps.
 *
 * Tools:
 * 1. poll_pending_discoveries  — finds pending discoveries and queues them
 * 2. run_simocracy_validation  — runs 4-Sim Senate on a discovery
 * 3. generate_zk_proof         — calls Rust prover CLI subprocess
 * 4. submit_onchain_attestation— uploads to 0G + calls DiscoveryVerifier
 * 5. update_ens_records        — increments discoveries_count in ENS
 * 6. verify_claim              — text search over completed discoveries
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { getDiscoveries } from '@simoproof/mock-discovery';
import { submitToSenate } from '@simoproof/simocracy';
import { uploadDiscoveryPackage } from '@simoproof/storage';
import type { DiscoveryRecord, ProofOutput, SimocracyResult } from '@simoproof/types';
import { emitKeeperEvent } from './jobs.js';

// In-memory state — swap for Redis/SQLite in production
const state = new Map<string, {
  discovery:    DiscoveryRecord;
  simResult?:   SimocracyResult;
  proof?:       ProofOutput;
  easUid?:      `0x${string}`;
  ipfsCid?:     string;
}>();

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name:    'simoproof',
    version: '3.0.0',
  });

  // ── Tool 1: poll_pending_discoveries ─────────────────────────────────
  server.tool(
    'poll_pending_discoveries',
    'Poll mock-discovery module for new pending discoveries and queue them for validation',
    {},
    async () => {
      const all = getDiscoveries().filter(d => !state.has(d.id));
      const newOnes = all.filter(d => d.status === 'pending');

      for (const d of newOnes) {
        state.set(d.id, { discovery: d });
        await emitKeeperEvent('discovery.pending', d.id);
      }

      const msg = `Queued ${newOnes.length} new discovery(ies). State: ${state.size} total.`;
      console.log(`[mcp] poll_pending_discoveries: ${msg}`);
      return { content: [{ type: 'text', text: msg }] };
    }
  );

  // ── Tool 2: run_simocracy_validation ─────────────────────────────────
  server.tool(
    'run_simocracy_validation',
    'Run 4-Sim Simocracy Science Senate validation for a pending discovery',
    { discoveryId: z.string().describe('Discovery ID from mock-discovery fixtures') },
    async ({ discoveryId }) => {
      const entry = state.get(discoveryId);
      if (!entry) {
        return { content: [{ type: 'text', text: `ERROR: Unknown discovery ${discoveryId}` }] };
      }

      console.log(`[mcp] run_simocracy_validation: ${discoveryId}`);
      try {
        const simResult = await submitToSenate(entry.discovery);
        state.set(discoveryId, { ...entry, simResult });

        if (simResult.consensusMet) {
          await emitKeeperEvent('discovery.validated', discoveryId);
        }

        const msg = JSON.stringify({
          discoveryId,
          consensusMet: simResult.consensusMet,
          votes:        simResult.voteCount,
          atprotoCid:   simResult.atprotoCid,
        });
        console.log(`[mcp] Simocracy result: ${msg}`);
        return { content: [{ type: 'text', text: msg }] };
      } catch (e) {
        const msg = `ERROR: ${e}`;
        return { content: [{ type: 'text', text: msg }] };
      }
    }
  );

  // ── Tool 3: generate_zk_proof ─────────────────────────────────────────
  server.tool(
    'generate_zk_proof',
    'Generate a Risc0 ZK proof for a validated discovery using the Bonsai prover',
    { discoveryId: z.string().describe('Discovery ID that has passed Simocracy validation') },
    async ({ discoveryId }) => {
      const entry = state.get(discoveryId);
      if (!entry?.simResult) {
        return { content: [{ type: 'text', text: `ERROR: No Simocracy result for ${discoveryId}` }] };
      }

      console.log(`[mcp] generate_zk_proof: ${discoveryId}`);

      // Build prover input JSON
      const proverInput = {
        raw_source_bytes:     entry.discovery.rawSourceBytes.map(b => Array.from(b)),
        api_source_hashes:    entry.discovery.apiSourceHashes,
        consensus_hash:       Array.from(
          Buffer.from(entry.simResult.consensusHash.slice(2), 'hex')
        ),
        consensus_vote_count: entry.simResult.voteCount,
        claim:                entry.discovery.claim,
        confidence:           entry.discovery.confidence,
        timestamp:            entry.discovery.timestamp,
      };

      const inputPath  = `/tmp/prover-input-${discoveryId}.json`;
      const outputPath = `/tmp/proof-${discoveryId}.json`;
      writeFileSync(inputPath, JSON.stringify(proverInput));

      try {
        const cwd = process.env.PROJECT_ROOT ?? process.cwd();
        execSync(
          `cargo run -p simoproof-prover --release -- --input ${inputPath} --output ${outputPath}`,
          { stdio: 'inherit', cwd, timeout: 300_000 }
        );
        const proof = JSON.parse(readFileSync(outputPath, 'utf8')) as ProofOutput;
        state.set(discoveryId, { ...entry, proof });
        await emitKeeperEvent('discovery.proved', discoveryId);

        const msg = `Proof generated. imageId=${proof.imageId?.slice(0, 18)}...`;
        console.log(`[mcp] ${msg}`);
        return { content: [{ type: 'text', text: msg }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `ERROR generating proof: ${e}` }] };
      }
    }
  );

  // ── Tool 4: submit_onchain_attestation ────────────────────────────────
  server.tool(
    'submit_onchain_attestation',
    'Upload discovery package to 0G storage and submit on-chain EAS attestation',
    { discoveryId: z.string().describe('Discovery ID with a valid ZK proof') },
    async ({ discoveryId }) => {
      const entry = state.get(discoveryId);
      if (!entry?.proof || !entry?.simResult) {
        return { content: [{ type: 'text', text: `ERROR: Missing proof or simResult for ${discoveryId}` }] };
      }

      console.log(`[mcp] submit_onchain_attestation: ${discoveryId}`);

      try {
        // 1. Upload to 0G
        const { discovery, proof, simResult } = entry;
        const storableDiscovery = {
          ...discovery,
          rawSourceBytes: '[redacted]' as unknown as Buffer[],
        };
        const ipfsCid = await uploadDiscoveryPackage({
          discovery:       storableDiscovery as unknown as import('@simoproof/types').DiscoveryPackage['discovery'],
          proof,
          simocracyResult: simResult,
        });

        // 2. Submit on-chain
        const { submitDiscovery } = await import('@simoproof/chain');
        const easUid = await submitDiscovery({
          seal:         proof.seal,
          journalBytes: proof.journalBytes,
          ipfsCid,
          ensName:      process.env.ENS_SUBNAME ?? 'node-1.simoproof.eth',
        });

        state.set(discoveryId, { ...entry, easUid, ipfsCid });
        await emitKeeperEvent('discovery.attested', discoveryId);

        const msg = JSON.stringify({ discoveryId, easUid, ipfsCid });
        console.log(`[mcp] Attestation submitted: ${msg}`);
        return { content: [{ type: 'text', text: msg }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `ERROR: ${e}` }] };
      }
    }
  );

  // ── Tool 5: update_ens_records ────────────────────────────────────────
  server.tool(
    'update_ens_records',
    'Update ENS ENSIP-25 text records (discoveries_count, latest_eas_uid) after attestation',
    { discoveryId: z.string().describe('Discovery ID that has been attested on-chain') },
    async ({ discoveryId }) => {
      const entry = state.get(discoveryId);
      if (!entry?.easUid) {
        return { content: [{ type: 'text', text: `ERROR: No EAS UID for ${discoveryId}` }] };
      }

      console.log(`[mcp] update_ens_records: ${discoveryId}`);
      try {
        const { updateDiscoveryCount } = await import('@simoproof/chain');
        await updateDiscoveryCount(
          process.env.ENS_SUBNAME ?? 'node-1.simoproof.eth',
          entry.easUid
        );
        entry.discovery.status = 'complete';
        const msg = `ENS updated for ${discoveryId}. easUid=${entry.easUid}`;
        console.log(`[mcp] ${msg}`);
        return { content: [{ type: 'text', text: msg }] };
      } catch (e) {
        return { content: [{ type: 'text', text: `ERROR: ${e}` }] };
      }
    }
  );

  // ── Tool 6: verify_claim ──────────────────────────────────────────────
  server.tool(
    'verify_claim',
    'Search completed discoveries for a matching claim and return its EAS UID',
    { text: z.string().describe('Plain text search query') },
    async ({ text }) => {
      const query    = text.toLowerCase();
      const matching = [...state.entries()].filter(
        ([, e]) => e.discovery.status === 'complete' &&
                   e.discovery.claim.toLowerCase().includes(query)
      );

      if (!matching.length) {
        return { content: [{ type: 'text', text: 'No verified discovery found matching that query' }] };
      }

      const [, entry] = matching[0];
      const result = JSON.stringify({
        verified:   true,
        claim:      entry.discovery.claim,
        confidence: entry.discovery.confidence,
        easUid:     entry.easUid,
        ipfsCid:    entry.ipfsCid,
      });
      return { content: [{ type: 'text', text: result }] };
    }
  );

  return server;
}

/** Start MCP server on stdio (for direct MCP client connections) */
export async function startMcpServer(): Promise<void> {
  const server    = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('[mcp] SimoProof MCP server started on stdio');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer().catch(console.error);
}
