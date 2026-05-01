/**
 * Local AXL network manager — starts 3 AXL processes for the hackathon demo.
 * Uses @0xagentio/axl-local which wraps the real Gensyn AXL binary.
 */
import { startLocalAxlNetwork, type LocalAxlNetwork } from '@0xagentio/axl-local';
import { join } from 'path';

const AXL_BINARY = process.env.AXL_BINARY_PATH ?? '/workspace/axl-node';
const AXL_WORK_DIR = process.env.AXL_WORKING_DIR ?? '/tmp/axl-nodes';

export interface SimoProofNetwork {
  network: LocalAxlNetwork;
  node1PeerId: string;
  node2PeerId: string;
  node3PeerId: string;
  node1Url: string;
  node2Url: string;
  node3Url: string;
  stop: () => Promise<void>;
}

/**
 * Start a local 3-node AXL network for development/demo.
 * Each node runs as a separate process (required for Gensyn AXL prize).
 */
export async function startSimoProofNetwork(): Promise<SimoProofNetwork> {
  console.log('[axl] Starting 3-node local AXL network...');
  console.log(`[axl] Binary: ${AXL_BINARY}`);
  console.log(`[axl] Working dir: ${AXL_WORK_DIR}`);

  // Node 1 is the bootstrap node with a listen address
  // Nodes 2 and 3 peer to Node 1
  const network = await startLocalAxlNetwork({
    binaryPath:       AXL_BINARY,
    workingDirectory: AXL_WORK_DIR,
    startupTimeoutMs: 30_000,
    readinessPollMs:  200,
    nodes: [
      {
        name:      'simoproof-node-1',
        apiPort:   7001,
        tcpPort:   9001,
        listen:    ['tls://127.0.0.1:9001'],
        peers:     [],
      },
      {
        name:      'simoproof-node-2',
        apiPort:   7002,
        tcpPort:   9002,
        listen:    [],
        peers:     ['tls://127.0.0.1:9001'],
      },
      {
        name:      'simoproof-node-3',
        apiPort:   7003,
        tcpPort:   9003,
        listen:    [],
        peers:     ['tls://127.0.0.1:9001'],
      },
    ],
  });

  const node1 = network.node('simoproof-node-1');
  const node2 = network.node('simoproof-node-2');
  const node3 = network.node('simoproof-node-3');

  console.log(`[axl] Node 1 ready: peerId=${node1.peerId.slice(0, 16)}...`);
  console.log(`[axl] Node 2 ready: peerId=${node2.peerId.slice(0, 16)}...`);
  console.log(`[axl] Node 3 ready: peerId=${node3.peerId.slice(0, 16)}...`);

  return {
    network,
    node1PeerId: node1.peerId,
    node2PeerId: node2.peerId,
    node3PeerId: node3.peerId,
    node1Url:    node1.baseUrl,
    node2Url:    node2.baseUrl,
    node3Url:    node3.baseUrl,
    stop:        () => network.stop(),
  };
}
