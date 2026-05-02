/**
 * Mini-Senate fallback — runs when ATProto/Simocracy is unavailable.
 * Uses any OpenAI-compatible API (GPT-4o-mini by default, but configurable
 * via LLM_BASE_URL + LLM_MODEL env vars to work with Anthropic, Ollama, etc.)
 */
import OpenAI from 'openai';
import { keccak256, toBytes } from 'viem';
import { CONSTITUTIONS } from './constitutions.js';
import type { DiscoveryRecord, SimocracyResult } from '@simoproof/types';

/**
 * Mock senate for dev/test mode (when OPENAI_API_KEY starts with 'sk-mock').
 * Returns 4/4 ENDORSE with deterministic responses based on claim hash.
 */
function mockMiniSenate(discovery: DiscoveryRecord): SimocracyResult {
  const simNames = Object.keys(CONSTITUTIONS);
  const results = simNames.map((simName, i) => ({
    sim:     simName,
    text:    `ENDORSE [dev-mock] Claim verified: confidence=${discovery.confidence.toFixed(2)} meets threshold. Data integrity confirmed by hash commitment.`,
    verdict: 'ENDORSE' as const,
  }));

  const transcript = results
    .map(r => `## ${r.sim}\n${r.text}`)
    .join('\n\n---\n\n');

  const consensusHash = keccak256(toBytes(`mock:${discovery.claim}:${discovery.confidence}`)) as `0x${string}`;
  const atprotoCid    = `mini-senate-mock-${consensusHash.slice(2, 18)}`;

  console.log(`[mini-senate] Votes: ${results.map(r => `${r.sim.split('-')[0]}:${r.verdict}`).join(' | ')}`);
  console.log(`[mini-senate] Endorsements: ${results.length}/4 (need 2) [dev mock]`);

  return {
    consensusMet:  true,
    voteCount:     results.length,
    atprotoCid,
    consensusHash,
    transcript,
  };
}

export async function runMiniSenate(discovery: DiscoveryRecord): Promise<SimocracyResult> {
  // In dev/test mode (mock API key), return deterministic mock senate result
  const apiKey = process.env.OPENAI_API_KEY ?? 'sk-placeholder';
  if (apiKey.startsWith('sk-mock')) {
    console.log('[mini-senate] Mock API key detected — using deterministic mock senate (dev mode)');
    return mockMiniSenate(discovery);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL ?? undefined,
  });

  const sourceHashPreview = discovery.apiSourceHashes
    .map(h => Buffer.from(h).toString('hex').slice(0, 16) + '...')
    .join(', ');

  const userPrompt = `Claim: "${discovery.claim}"

Source: ${discovery.sourceDescription}
Confidence score: ${discovery.confidence.toFixed(2)}
Causal summary: ${discovery.causalSummary}
Source hash commitments: [${sourceHashPreview}]

Evaluate this claim according to your constitution.
Respond with exactly one line starting with ENDORSE or REJECT, then a brief reason (≤2 sentences).`;

  const simNames = Object.keys(CONSTITUTIONS);

  const responses = await Promise.allSettled(
    simNames.map(async (simName) => {
      const constitution = CONSTITUTIONS[simName];
      let text = 'REJECT could not reach LLM endpoint';
      try {
        const res = await client.chat.completions.create({
          model:       process.env.LLM_MODEL ?? 'gpt-4o-mini',
          messages: [
            { role: 'system', content: constitution },
            { role: 'user',   content: userPrompt },
          ],
          max_tokens:  150,
          temperature: 0.3,
        });
        text = res.choices[0]?.message?.content?.trim() ?? 'REJECT no response';
      } catch (e) {
        console.warn(`[mini-senate] ${simName} failed: ${e}`);
        text = 'REJECT LLM call failed';
      }
      const verdict = text.trimStart().toUpperCase().startsWith('ENDORSE') ? 'ENDORSE' : 'REJECT';
      return { sim: simName, text, verdict };
    })
  );

  const results = responses.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return { sim: simNames[i], text: 'REJECT (error)', verdict: 'REJECT' };
  });

  const transcript = results
    .map(r => `## ${r.sim}\n${r.text}`)
    .join('\n\n---\n\n');

  const consensusHash = keccak256(toBytes(transcript)) as `0x${string}`;
  const endorsements  = results.filter(r => r.verdict === 'ENDORSE');
  const atprotoCid    = `mini-senate-${consensusHash.slice(2, 18)}`;

  console.log(`[mini-senate] Votes: ${results.map(r => `${r.sim.split('-')[0]}:${r.verdict}`).join(' | ')}`);
  console.log(`[mini-senate] Endorsements: ${endorsements.length}/4 (need 2)`);

  return {
    consensusMet:  endorsements.length >= 2,
    voteCount:     endorsements.length,
    atprotoCid,
    consensusHash,
    transcript,
  };
}
