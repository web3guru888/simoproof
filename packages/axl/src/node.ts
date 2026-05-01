/**
 * SimoProof AXL Node — wraps @0xagentio/axl-client for pre-validation broadcasts.
 * Uses the real Gensyn AXL HTTP bridge API.
 */
import { createAxlClient, type AxlClient } from '@0xagentio/axl-client';
import type {
  DiscoveryRecord,
  DiscoveryBroadcast,
  PreValidationResponse,
} from '@simoproof/types';

// Re-export type that axl-client doesn't export by name
type AxlClientType = ReturnType<typeof createAxlClient>;

export class SimoProofAxlNode {
  private client: AxlClientType;
  public readonly nodeId: string;
  public readonly baseUrl: string;
  public peerId?: string;

  constructor(nodeId: string, baseUrl: string) {
    this.nodeId  = nodeId;
    this.baseUrl = baseUrl;
    this.client  = createAxlClient({ baseUrl });
  }

  /** Get this node's peer ID from the AXL topology */
  async getPeerId(): Promise<string> {
    const topology = await this.client.getTopology();
    if (!topology.ourPublicKey) {
      throw new Error(`[axl:${this.nodeId}] Node not yet ready — no public key`);
    }
    this.peerId = topology.ourPublicKey;
    return topology.ourPublicKey;
  }

  /** Get list of connected peer IDs */
  async getPeerIds(): Promise<string[]> {
    const topology = await this.client.getTopology();
    return (topology.peers as Array<{ publicKey?: string }>)
      ?.map(p => p.publicKey)
      .filter((k): k is string => !!k) ?? [];
  }

  /**
   * Broadcast a discovery to peer nodes for pre-validation.
   * Non-blocking: returns whatever responses arrive within timeout.
   */
  async broadcastForPreValidation(
    discovery: DiscoveryRecord,
    peerIds: string[],
    timeoutMs = 5000
  ): Promise<PreValidationResponse[]> {
    const broadcast: DiscoveryBroadcast = {
      type:            'discovery_broadcast',
      claimHash:       Buffer.from(discovery.claimHash).toString('hex'),
      apiSourceHashes: discovery.apiSourceHashes.map(h => Buffer.from(h).toString('hex')),
      confidence:      discovery.confidence,
      causalSummary:   discovery.causalSummary,
      timestamp:       discovery.timestamp,
    };
    const payload = new TextEncoder().encode(JSON.stringify(broadcast));

    // Send to all peers (fire and forget)
    const sendResults = await Promise.allSettled(
      peerIds.slice(0, 2).map(pid =>
        this.client.send({ peerId: pid, body: payload })
      )
    );
    sendResults.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`[axl:${this.nodeId}] send to peer ${peerIds[i]?.slice(0, 12)}... failed: ${r.reason}`);
      }
    });

    // Poll for responses with timeout
    const responses: PreValidationResponse[] = [];
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline && responses.length < peerIds.length) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const msg = await this.client.recv();
        if (msg) {
          const parsed = JSON.parse(new TextDecoder().decode(msg.body)) as PreValidationResponse;
          responses.push({ ...parsed, peerId: msg.fromPeerId });
        }
      } catch { /* no message yet */ }
    }

    return responses;
  }

  /**
   * Start listening for incoming messages and auto-respond with pre-validation.
   * Runs in background — call stop() to halt.
   */
  startListening(): NodeJS.Timer {
    const interval = setInterval(async () => {
      try {
        const msg = await this.client.recv();
        if (!msg) return;

        const text = new TextDecoder().decode(msg.body);
        let broadcast: DiscoveryBroadcast;
        try {
          broadcast = JSON.parse(text);
        } catch {
          return; // not a discovery broadcast
        }
        if (broadcast.type !== 'discovery_broadcast') return;

        // Simple pre-validation heuristic
        const preScore = broadcast.confidence >= 0.85 ? 0.9 :
                         broadcast.confidence >= 0.70 ? 0.75 : 0.4;
        const concerns: string[] = [];
        if (broadcast.confidence < 0.70) concerns.push('confidence below recommended threshold');
        if (!broadcast.apiSourceHashes.length) concerns.push('no source hashes provided');

        const response: PreValidationResponse = {
          nodeId:   this.nodeId,
          peerId:   this.peerId ?? 'unknown',
          preScore,
          concerns,
        };

        await this.client.send({
          peerId: msg.fromPeerId,
          body:   new TextEncoder().encode(JSON.stringify(response)),
        });

        console.log(`[axl:${this.nodeId}] Pre-validated broadcast from ${msg.fromPeerId.slice(0, 12)}...: score=${preScore}`);
      } catch { /* ignore recv errors */ }
    }, 500);

    return interval;
  }
}

/**
 * Helper: evaluates a discovery broadcast and returns a pre-validation score.
 * Used by listener nodes that don't have access to raw data.
 */
export function evaluateDiscoveryBroadcast(broadcast: DiscoveryBroadcast): PreValidationResponse {
  const preScore = broadcast.confidence >= 0.85 ? 0.9 :
                   broadcast.confidence >= 0.70 ? 0.75 : 0.4;
  return {
    nodeId:   'remote',
    peerId:   'remote',
    preScore,
    concerns: broadcast.confidence < 0.70 ? ['confidence below recommended threshold'] : [],
  };
}
