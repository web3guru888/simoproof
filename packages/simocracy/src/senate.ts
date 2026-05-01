/**
 * Simocracy Science Senate — ATProto-based multi-Sim deliberation.
 * Falls back to mini-senate if ATProto credentials are not configured.
 * 
 * Uses @atproto/api v0.13+ API (app.bsky.feed.post.create, etc.)
 */
import { AtpAgent } from '@atproto/api';
import { keccak256, toBytes } from 'viem';
import type { DiscoveryRecord, SimocracyResult } from '@simoproof/types';
import { runMiniSenate } from './mini-senate.js';

const ATPROTO_SERVICE   = 'https://bsky.social';
const POLL_INTERVAL_MS  = 10_000;   // poll every 10s
const POLL_TIMEOUT_MS   = 300_000;  // 5 minutes max

export async function submitToSenate(discovery: DiscoveryRecord): Promise<SimocracyResult> {
  // If no ATProto credentials, use mini-senate
  if (!process.env.ATPROTO_HANDLE || !process.env.ATPROTO_PASSWORD) {
    console.log('[senate] ATProto credentials not set — using mini-senate fallback');
    return runMiniSenate(discovery);
  }

  try {
    return await runAtProtoSenate(discovery);
  } catch (e) {
    console.warn(`[senate] ATProto senate failed, falling back to mini-senate: ${e}`);
    return runMiniSenate(discovery);
  }
}

async function runAtProtoSenate(discovery: DiscoveryRecord): Promise<SimocracyResult> {
  const agent = new AtpAgent({ service: ATPROTO_SERVICE });
  await agent.login({
    identifier: process.env.ATPROTO_HANDLE!,
    password:   process.env.ATPROTO_PASSWORD!,
  });

  // Post discovery proposal to ATProto using new v0.13+ API
  const sourceHashPreview = discovery.apiSourceHashes
    .map(h => Buffer.from(h).toString('hex').slice(0, 8))
    .join(',');

  const proposalText = [
    `[SimoProof Senate] ${discovery.claim}`,
    `Confidence: ${discovery.confidence.toFixed(2)}`,
    `Source hashes: [${sourceHashPreview}...]`,
    `Causal: ${discovery.causalSummary.slice(0, 100)}`,
  ].join('\n');

  // Use app.bsky.feed.post.create() in new API
  const repo = agent.accountDid ?? agent.did ?? '';
  const { uri, cid } = await agent.app.bsky.feed.post.create(
    { repo },
    {
      text:      proposalText,
      createdAt: new Date().toISOString(),
      $type:     'app.bsky.feed.post',
    }
  );

  console.log(`[senate] Proposal posted: ${uri}`);

  // Poll for Sim deliberations
  const simDids = (process.env.SIM_DIDS ?? '').split(',').filter(Boolean);
  const votes   = await pollForDeliberations(agent, uri, simDids, POLL_TIMEOUT_MS);

  const endorsements  = votes.filter(v => v.verdict === 'ENDORSE');
  const transcript    = votes.map(v => `## ${v.sim}\n${v.verdict}: ${v.reasoning}`).join('\n\n---\n\n');
  const consensusHash = keccak256(toBytes(cid.toString())) as `0x${string}`;

  console.log(`[senate] ATProto deliberation complete. ${endorsements.length}/4 endorsements.`);

  return {
    consensusMet:  endorsements.length >= 3,
    voteCount:     endorsements.length,
    atprotoCid:    cid.toString(),
    consensusHash,
    transcript,
  };
}

async function pollForDeliberations(
  agent: AtpAgent,
  proposalUri: string,
  simDids: string[],
  timeoutMs: number
): Promise<Array<{ sim: string; verdict: string; reasoning: string }>> {
  const deadline = Date.now() + timeoutMs;
  const votes: Array<{ sim: string; verdict: string; reasoning: string }> = [];

  while (Date.now() < deadline && votes.length < 4) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    try {
      // Use new v0.13+ API: agent.app.bsky.feed.getPostThread
      const thread = await agent.app.bsky.feed.getPostThread({ uri: proposalUri });
      const replies = ((thread.data.thread as Record<string, unknown>).replies as Array<Record<string, unknown>>) ?? [];

      for (const reply of replies) {
        const post       = reply.post as Record<string, unknown>;
        const authorDid  = (post.author as Record<string, unknown>)?.did as string;
        const text       = ((post.record as Record<string, unknown>)?.text as string) ?? '';

        if (!simDids.length || simDids.includes(authorDid)) {
          if (!votes.find(v => v.sim === authorDid)) {
            const verdict = text.trimStart().toUpperCase().startsWith('ENDORSE') ? 'ENDORSE' : 'REJECT';
            votes.push({ sim: authorDid, verdict, reasoning: text.slice(0, 200) });
            console.log(`[senate] Vote from ${authorDid.slice(0, 20)}...: ${verdict}`);
          }
        }
      }
    } catch (e) {
      console.warn(`[senate] Poll failed: ${e}`);
    }
  }

  return votes;
}
