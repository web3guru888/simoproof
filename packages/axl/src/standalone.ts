/**
 * Standalone AXL node listener — runs as a separate process.
 * Started by the pipeline orchestrator for nodes 2 and 3.
 * Listens for DiscoveryBroadcast messages and responds with PreValidationResponse.
 */
import { createAxlClient } from '@0xagentio/axl-client';
import type { DiscoveryBroadcast, PreValidationResponse } from '@simoproof/types';

const NODE_ID  = process.env.AXL_NODE_ID  ?? 'simoproof-node-2';
const API_PORT = parseInt(process.env.AXL_API_PORT ?? '7002');
const BASE_URL = `http://127.0.0.1:${API_PORT}`;

const client = createAxlClient({ baseUrl: BASE_URL });

console.log(`[axl-standalone] ${NODE_ID} starting on ${BASE_URL}`);

// Get our peer ID
async function getPeerId(): Promise<string> {
  for (let i = 0; i < 50; i++) {
    try {
      const topology = await client.getTopology();
      if (topology.ourPublicKey) return topology.ourPublicKey;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`${NODE_ID} did not become ready`);
}

// Main listen loop
async function main() {
  const peerId = await getPeerId();
  console.log(`[axl-standalone] ${NODE_ID} ready: ${peerId.slice(0, 16)}...`);

  while (true) {
    try {
      const msg = await client.recv();
      if (!msg) {
        await new Promise(r => setTimeout(r, 300));
        continue;
      }

      const text = new TextDecoder().decode(msg.body);
      let broadcast: DiscoveryBroadcast;
      try {
        broadcast = JSON.parse(text) as DiscoveryBroadcast;
      } catch {
        continue; // not a JSON message
      }

      if (broadcast.type !== 'discovery_broadcast') continue;

      // Pre-validation heuristic
      const preScore = broadcast.confidence >= 0.85 ? 0.90 :
                       broadcast.confidence >= 0.70 ? 0.75 : 0.40;
      const concerns: string[] = [];
      if (broadcast.confidence < 0.70) concerns.push('confidence below recommended threshold');
      if (!broadcast.apiSourceHashes?.length) concerns.push('no source hash commitments');

      const response: PreValidationResponse = {
        nodeId:   NODE_ID,
        peerId,
        preScore,
        concerns,
      };

      await client.send({
        peerId: msg.fromPeerId,
        body:   new TextEncoder().encode(JSON.stringify(response)),
      });

      console.log(`[axl-standalone] ${NODE_ID} validated claim hash ${broadcast.claimHash.slice(0,8)}... → score=${preScore}`);
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

main().catch(console.error);
