/**
 * One-time setup script:
 * 1. Start 3 local AXL nodes and print their peer IDs
 * 2. Register ENS subnames + ENSIP-25 text records
 * 3. Print environment variables to add to .env
 *
 * Usage: npx tsx scripts/setup.ts
 */
import 'dotenv/config';
import { startSimoProofNetwork } from '@simoproof/axl';
import { registerAgentNode } from '@simoproof/chain';

async function main() {
  console.log('═══ SimoProof Setup ═══\n');

  // 1. Start AXL network
  console.log('Step 1: Starting 3-node AXL network...');
  let network;
  try {
    network = await startSimoProofNetwork();
    console.log('\nAXL nodes started:');
    console.log(`  Node 1: ${network.node1PeerId.slice(0, 24)}... (${network.node1Url})`);
    console.log(`  Node 2: ${network.node2PeerId.slice(0, 24)}... (${network.node2Url})`);
    console.log(`  Node 3: ${network.node3PeerId.slice(0, 24)}... (${network.node3Url})`);

    console.log('\nAdd to .env:');
    console.log(`AXL_NODE_1_URL=${network.node1Url}`);
    console.log(`AXL_NODE_2_URL=${network.node2Url}`);
    console.log(`AXL_NODE_3_URL=${network.node3Url}`);
    console.log(`AXL_PEER_IDS=${network.node2PeerId},${network.node3PeerId}`);
  } catch (e) {
    console.warn(`AXL network start failed (check AXL_BINARY_PATH): ${e}`);
    console.warn('You can start nodes manually using docker-compose or the standalone script.');
  }

  // 2. Register ENS subnames
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000001') {
    console.log('\nStep 2: Skipping ENS registration (PRIVATE_KEY not set)');
    console.log('  Set PRIVATE_KEY in .env and re-run to register ENS subnames.');
  } else {
    console.log('\nStep 2: Registering ENS subnames...');
    console.log('  (Requires simoproof.eth to be registered and owned by your wallet)');

    const axlPubkey1 = network?.node1PeerId ?? 'unknown';
    const axlPubkey2 = network?.node2PeerId ?? 'unknown';
    const axlPubkey3 = network?.node3PeerId ?? 'unknown';

    try {
      await registerAgentNode('node-1.simoproof.eth', axlPubkey1, 'discovery,validation,proving');
      await registerAgentNode('node-2.simoproof.eth', axlPubkey2, 'pre-validation');
      await registerAgentNode('node-3.simoproof.eth', axlPubkey3, 'pre-validation');
      console.log('  ENS subnames registered!');
    } catch (e) {
      console.warn(`  ENS registration failed: ${e}`);
      console.warn('  This is expected if the ENS names are not yet registered on Sepolia.');
      console.warn('  Register simoproof.eth at app.ens.domains first.');
    }
  }

  console.log('\n═══ Setup complete ═══');
  console.log('Next: Run `npx tsx scripts/demo.ts` to run the full pipeline demo.');

  if (network) await network.stop();
}

main().catch(console.error);
