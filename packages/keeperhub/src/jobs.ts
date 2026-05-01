/**
 * KeeperHub workflow definitions for the SimoProof pipeline.
 * Uses keeperhub-sdk to create 5 automated workflows.
 *
 * The pipeline is fully event-driven:
 * Discovery Poll (interval) → Validate → Prove → Attest → ENS Update
 */
import { KeeperHub } from 'keeperhub-sdk';

export async function createAllJobs(): Promise<void> {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) {
    console.warn('[keeperhub] KEEPERHUB_API_KEY not set — skipping job creation');
    return;
  }

  const keeper = new KeeperHub({
    apiKey,
    baseUrl: process.env.KEEPERHUB_BASE_URL ?? 'https://api.keeperhub.com',
  });

  const mcpServerUrl = `http://localhost:${process.env.PORT ?? 3000}/mcp`;

  console.log('[keeperhub] Creating pipeline workflows...');

  // ── Job 1: Poll for new pending discoveries every 30s ────────────────
  await keeper.workflows.create({
    name:        'simoproof-poll-discoveries',
    description: 'Poll mock-discovery module every 30s for new pending discoveries',
    trigger: {
      type:            'schedule',
      cronExpression:  '*/30 * * * * *',  // every 30 seconds
    },
    steps: [{
      id:   'poll',
      type: 'http',
      config: {
        url:    mcpServerUrl,
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method:  'tools/call',
          params:  { name: 'poll_pending_discoveries', arguments: {} },
          id:      1,
        },
      },
    }],
    retryPolicy: { maxAttempts: 3, backoffSeconds: [15, 45, 120] },
  });
  console.log('[keeperhub] ✓ simoproof-poll-discoveries');

  // ── Job 2: Run Simocracy Senate validation ────────────────────────────
  await keeper.workflows.create({
    name:        'simoproof-validate',
    description: 'Run 4-Sim Simocracy Science Senate validation for each pending discovery',
    trigger: {
      type:      'webhook',
      eventName: 'discovery.pending',
    },
    steps: [{
      id:   'validate',
      type: 'http',
      config: {
        url:    mcpServerUrl,
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method:  'tools/call',
          params: {
            name:      'run_simocracy_validation',
            arguments: { discoveryId: '{{event.payload.discoveryId}}' },
          },
          id: 2,
        },
      },
    }],
    retryPolicy: { maxAttempts: 3, backoffSeconds: [30, 90, 300] },
  });
  console.log('[keeperhub] ✓ simoproof-validate');

  // ── Job 3: Generate Risc0 ZK proof ────────────────────────────────────
  await keeper.workflows.create({
    name:        'simoproof-prove',
    description: 'Generate Risc0 ZK proof via Bonsai after validation passes',
    trigger: {
      type:      'webhook',
      eventName: 'discovery.validated',
    },
    steps: [{
      id:   'prove',
      type: 'http',
      config: {
        url:    mcpServerUrl,
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method:  'tools/call',
          params: {
            name:      'generate_zk_proof',
            arguments: { discoveryId: '{{event.payload.discoveryId}}' },
          },
          id: 3,
        },
      },
    }],
    // Proof generation is slow — use longer backoff
    retryPolicy: { maxAttempts: 3, backoffSeconds: [60, 180, 600] },
  });
  console.log('[keeperhub] ✓ simoproof-prove');

  // ── Job 4: Submit on-chain EAS attestation ────────────────────────────
  await keeper.workflows.create({
    name:        'simoproof-attest',
    description: 'Submit DiscoveryVerifier.submitDiscovery() on Base Sepolia after proof is ready',
    trigger: {
      type:      'webhook',
      eventName: 'discovery.proved',
    },
    steps: [{
      id:   'attest',
      type: 'http',
      config: {
        url:    mcpServerUrl,
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method:  'tools/call',
          params: {
            name:      'submit_onchain_attestation',
            arguments: { discoveryId: '{{event.payload.discoveryId}}' },
          },
          id: 4,
        },
      },
    }],
    // On-chain txs may fail due to gas/network — use aggressive retry
    retryPolicy: { maxAttempts: 5, backoffSeconds: [30, 60, 120, 300, 600] },
  });
  console.log('[keeperhub] ✓ simoproof-attest');

  // ── Job 5: Update ENS ENSIP-25 text records ───────────────────────────
  await keeper.workflows.create({
    name:        'simoproof-ens-update',
    description: 'Update ENS discoveries_count + latest_eas_uid text records after attestation',
    trigger: {
      type:      'webhook',
      eventName: 'discovery.attested',
    },
    steps: [{
      id:   'ens-update',
      type: 'http',
      config: {
        url:    mcpServerUrl,
        method: 'POST',
        body: {
          jsonrpc: '2.0',
          method:  'tools/call',
          params: {
            name:      'update_ens_records',
            arguments: { discoveryId: '{{event.payload.discoveryId}}' },
          },
          id: 5,
        },
      },
    }],
    retryPolicy: { maxAttempts: 5, backoffSeconds: [10, 30, 60, 120, 300] },
  });
  console.log('[keeperhub] ✓ simoproof-ens-update');

  console.log('[keeperhub] All 5 workflows created successfully');
}

/**
 * Emit a KeeperHub event to trigger the next pipeline stage.
 * Called by MCP tool handlers after each stage completes.
 */
export async function emitKeeperEvent(
  eventName: string,
  discoveryId: string
): Promise<void> {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) return; // skip if not configured

  const baseUrl = process.env.KEEPERHUB_BASE_URL ?? 'https://api.keeperhub.com';

  try {
    const res = await fetch(`${baseUrl}/v1/events`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        event:   eventName,
        payload: { discoveryId },
      }),
    });
    if (!res.ok) {
      console.warn(`[keeperhub] Failed to emit ${eventName}: ${res.status}`);
    }
  } catch (e) {
    console.warn(`[keeperhub] Event emit error: ${e}`);
  }
}
