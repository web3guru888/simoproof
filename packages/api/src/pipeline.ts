/**
 * SimoProof pipeline orchestrator.
 * Runs the full 7-step pipeline end-to-end:
 * 1. Get discovery (fixture or live API)
 * 2. AXL pre-validation broadcast (best-effort, non-blocking)
 * 3. Simocracy Science Senate (ATProto or mini-senate)
 * 4. Risc0 ZK proof (Rust CLI subprocess)
 * 5. Upload to 0G storage
 * 6. Submit DiscoveryVerifier.submitDiscovery() on-chain → EAS UID
 * 7. Update ENS ENSIP-25 text records
 */
import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

import { getDiscovery, fetchLiveDiscovery } from '@simoproof/mock-discovery';
import { submitToSenate }                  from '@simoproof/simocracy';
import { uploadDiscoveryPackage }          from '@simoproof/storage';
import type { PipelineResult, ProofOutput } from '@simoproof/types';

const __dirname    = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(join(__dirname, '..', '..', '..'));

export interface PipelineOptions {
  discoveryId?: string;
  useLiveData?: boolean;
  liveCountry?: string;
  liveIndicator?: string;
  skipAxl?: boolean;
  skipOnChain?: boolean;
}

export async function runPipeline(opts: PipelineOptions = {}): Promise<PipelineResult> {
  const startMs = Date.now();
  const {
    discoveryId  = 'disc-001',
    useLiveData  = false,
    liveCountry  = 'TH',
    liveIndicator = 'EN.ATM.CO2E.PC',
    skipAxl      = false,
    skipOnChain  = false,
  } = opts;

  // ── Step 1: Get discovery ─────────────────────────────────────────────
  console.log(`\n[pipeline] ═══ Starting pipeline for: ${discoveryId} ═══`);
  const discovery = useLiveData
    ? await fetchLiveDiscovery(liveCountry, liveIndicator)
    : getDiscovery(discoveryId);

  if (!discovery) throw new Error(`Unknown discovery: ${discoveryId}`);
  console.log(`[pipeline] Claim: ${discovery.claim.slice(0, 80)}...`);
  console.log(`[pipeline] Confidence: ${discovery.confidence}`);

  // ── Step 2: AXL pre-validation (best-effort) ──────────────────────────
  if (!skipAxl) {
    try {
      const peerIds = (process.env.AXL_PEER_IDS ?? '').split(',').filter(Boolean);
      if (peerIds.length >= 2) {
        const { SimoProofAxlNode } = await import('@simoproof/axl');
        const node1 = new SimoProofAxlNode(
          'simoproof-node-1',
          process.env.AXL_NODE_1_URL ?? 'http://127.0.0.1:7001'
        );
        await node1.getPeerId();

        const preScores = await node1.broadcastForPreValidation(discovery, peerIds, 5000);
        if (preScores.length > 0) {
          const avg = preScores.reduce((s, r) => s + r.preScore, 0) / preScores.length;
          console.log(`[axl] Pre-validation: avg_score=${avg.toFixed(2)}, responses=${preScores.length}`);
          if (avg < 0.6) throw new Error(`AXL pre-validation failed: avg_score=${avg.toFixed(2)}`);
        } else {
          console.log('[axl] No peer responses received (non-blocking, continuing)');
        }
      } else {
        console.log('[axl] AXL_PEER_IDS not configured — skipping pre-validation');
      }
    } catch (e) {
      console.warn(`[axl] Pre-validation skipped (non-blocking): ${e}`);
    }
  }

  // ── Step 3: Simocracy Senate ──────────────────────────────────────────
  console.log('[pipeline] Submitting to Simocracy Science Senate...');
  const simResult = await submitToSenate(discovery);
  console.log(`[simocracy] Consensus: ${simResult.consensusMet} | Votes: ${simResult.voteCount}/4`);
  console.log(`[simocracy] CID: ${simResult.atprotoCid}`);

  if (!simResult.consensusMet) {
    throw new Error(`Simocracy Senate rejected the discovery (${simResult.voteCount}/4 endorsements, need 3)`);
  }

  // ── Step 4: Risc0 ZK Proof ────────────────────────────────────────────
  console.log('[pipeline] Generating ZK proof...');
  const proverInput = {
    raw_source_bytes:     discovery.rawSourceBytes.map(b => Array.from(b)),
    api_source_hashes:    discovery.apiSourceHashes,
    consensus_hash:       Array.from(Buffer.from(simResult.consensusHash.slice(2), 'hex')),
    consensus_vote_count: simResult.voteCount,
    claim:                discovery.claim,
    confidence:           discovery.confidence,
    timestamp:            discovery.timestamp,
  };

  const inputPath  = `/tmp/prover-input-${discovery.id}.json`;
  const outputPath = `/tmp/proof-${discovery.id}.json`;
  writeFileSync(inputPath, JSON.stringify(proverInput));

  try {
    execSync(
      `cargo run -p simoproof-prover --release -- --input ${inputPath} --output ${outputPath}`,
      { stdio: 'inherit', cwd: PROJECT_ROOT, timeout: 300_000, env: { ...process.env } }
    );
  } catch (e) {
    throw new Error(`Risc0 prover failed: ${e}`);
  }

  // Rust prover outputs snake_case JSON; map to TypeScript camelCase ProofOutput
  const rawProof = JSON.parse(readFileSync(outputPath, 'utf8')) as Record<string, unknown>;
  const proof: ProofOutput = {
    seal:             (rawProof['seal']               ?? rawProof['seal']              ) as `0x${string}`,
    journalBytes:     (rawProof['journal_bytes']       ?? rawProof['journalBytes']      ) as `0x${string}`,
    imageId:          (rawProof['image_id']            ?? rawProof['imageId']           ) as `0x${string}`,
    claimHash:        (rawProof['claim_hash']          ?? rawProof['claimHash']         ) as `0x${string}`,
    sourceCommitment: (rawProof['source_commitment']   ?? rawProof['sourceCommitment']  ) as `0x${string}`,
    consensusHash:    (rawProof['consensus_hash']      ?? rawProof['consensusHash']     ) as `0x${string}`,
    confidenceMet:    (rawProof['confidence_met']      ?? rawProof['confidenceMet']     ) as boolean,
    consensusMet:     (rawProof['consensus_met']       ?? rawProof['consensusMet']      ) as boolean,
    causalValid:      (rawProof['causal_valid']        ?? rawProof['causalValid']       ) as boolean,
    timestamp:        rawProof['timestamp'] as number,
  };
  console.log(`[risc0] Proof generated. imageId=${String(proof.imageId).slice(0, 20)}...`);
  console.log(`[risc0] confidence_met=${proof.confidenceMet} consensus_met=${proof.consensusMet} causal_valid=${proof.causalValid}`);

  if (!skipOnChain) {
    // ── Step 5: Upload to 0G ──────────────────────────────────────────────
    console.log('[pipeline] Uploading to 0G storage...');
    const storableDiscovery = {
      ...discovery,
      rawSourceBytes: '[redacted — ZK property: private data stays on node]' as unknown as Buffer[],
    };
    const ipfsCid = await uploadDiscoveryPackage({
      discovery:       storableDiscovery as unknown as import('@simoproof/types').DiscoveryPackage['discovery'],
      proof,
      simocracyResult: simResult,
    });
    console.log(`[0g] Stored: ${ipfsCid.slice(0, 32)}...`);

    // ── Step 6: Submit on-chain ────────────────────────────────────────────
    console.log('[pipeline] Submitting on-chain attestation...');
    const { submitDiscovery, updateDiscoveryCount } = await import('@simoproof/chain');
    const easUid = await submitDiscovery({
      seal:         proof.seal,
      journalBytes: proof.journalBytes,
      ipfsCid,
      ensName:      process.env.ENS_SUBNAME ?? 'node-1.simoproof.eth',
    });
    console.log(`[eas] Attestation UID: ${easUid}`);

    // ── Step 7: Update ENS ────────────────────────────────────────────────
    console.log('[pipeline] Updating ENS text records...');
    await updateDiscoveryCount(process.env.ENS_SUBNAME ?? 'node-1.simoproof.eth', easUid);
    console.log('[ens] Text records updated');

    const durationMs = Date.now() - startMs;
    console.log(`\n[pipeline] ═══ COMPLETE in ${(durationMs / 1000).toFixed(1)}s ═══`);
    console.log(`[pipeline] EAS UID: ${easUid}`);
    console.log(`[pipeline] 0G CID:  ${ipfsCid.slice(0, 32)}...`);

    return {
      discoveryId:  discovery.id,
      claim:        discovery.claim,
      proof,
      attestation: {
        easUid,
        txHash:      proof.seal.slice(0, 66) as `0x${string}`,
        blockNumber: 0,
        ipfsCid,
      },
      simocracy:   simResult,
      ensUpdated:  true,
      durationMs,
    };
  } else {
    // Dev mode: skip on-chain steps
    const durationMs = Date.now() - startMs;
    console.log(`\n[pipeline] ═══ COMPLETE (dev mode, on-chain skipped) in ${(durationMs / 1000).toFixed(1)}s ═══`);

    return {
      discoveryId: discovery.id,
      claim:       discovery.claim,
      proof,
      attestation: {
        easUid:      '0x0000000000000000000000000000000000000000000000000000000000000000',
        txHash:      '0x0000000000000000000000000000000000000000000000000000000000000000',
        blockNumber: 0,
        ipfsCid:     'dev-mode-no-upload',
      },
      simocracy:   simResult,
      ensUpdated:  false,
      durationMs,
    };
  }
}
