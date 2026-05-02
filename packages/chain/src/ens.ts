/**
 * ENS identity layer — registers subnames and updates ENSIP-25 text records.
 * Uses viem for on-chain interactions on Sepolia.
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ENS Public Resolver on Sepolia (from docs.ens.domains/learn/deployments)
const PUBLIC_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as `0x${string}`;

// ENS Registry on Sepolia
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as `0x${string}`;

const TEXT_ABI = [
  {
    name:             'text',
    type:             'function',
    stateMutability:  'view',
    inputs: [
      { name: 'node',  type: 'bytes32' },
      { name: 'key',   type: 'string'  },
    ],
    outputs: [{ type: 'string' }],
  },
  {
    name:             'setText',
    type:             'function',
    stateMutability:  'nonpayable',
    inputs: [
      { name: 'node',  type: 'bytes32' },
      { name: 'key',   type: 'string'  },
      { name: 'value', type: 'string'  },
    ],
    outputs: [],
  },
] as const;

const REGISTRY_ABI = [
  {
    name:             'setSubnodeRecord',
    type:             'function',
    stateMutability:  'nonpayable',
    inputs: [
      { name: 'node',     type: 'bytes32' },
      { name: 'label',    type: 'bytes32' },
      { name: 'owner',    type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl',      type: 'uint64'  },
    ],
    outputs: [],
  },
] as const;

function getClients() {
  const account = privateKeyToAccount(
    (process.env.PRIVATE_KEY ?? '0x0000000000000000000000000000000000000000000000000000000000000001') as `0x${string}`
  );
  const rpc = process.env.SEPOLIA_RPC ?? 'https://rpc.sepolia.org';
  const pub  = createPublicClient({ chain: sepolia, transport: http(rpc) });
  const wal  = createWalletClient({ account, chain: sepolia, transport: http(rpc) });
  return { account, pub, wal };
}

/**
 * Read a text record from ENS resolver.
 */
export async function getTextRecord(ensName: string, key: string): Promise<string> {
  const { pub } = getClients();
  const node = namehash(ensName);
  const value = await pub.readContract({
    address:      PUBLIC_RESOLVER,
    abi:          TEXT_ABI,
    functionName: 'text',
    args:         [node, key],
  });
  return value as string;
}

/**
 * Set a text record on ENS resolver.
 */
export async function setTextRecord(
  ensName: string,
  key: string,
  value: string
): Promise<`0x${string}`> {
  const { wal } = getClients();
  const node = namehash(ensName);
  const hash = await wal.writeContract({
    address:      PUBLIC_RESOLVER,
    abi:          TEXT_ABI,
    functionName: 'setText',
    args:         [node, key, value],
  });
  console.log(`[ens] setText(${ensName}, ${key}, ${value.slice(0, 30)}...): ${hash}`);
  return hash;
}

/**
 * Update discovery count and latest EAS UID after successful attestation.
 * Called by KeeperHub job after each discovery is attested on-chain.
 */
export async function updateDiscoveryCount(
  ensName: string,
  easUid: `0x${string}`
): Promise<void> {
  // Read current count
  let current = '0';
  try {
    current = await getTextRecord(ensName, 'discoveries_count');
  } catch { /* first discovery */ }

  const newCount = (parseInt(current || '0') + 1).toString();

  // Update discoveries_count
  await setTextRecord(ensName, 'discoveries_count', newCount);

  // Update latest_eas_uid
  await setTextRecord(ensName, 'latest_eas_uid', easUid);

  console.log(`[ens] ${ensName}: discoveries_count=${newCount}, latest_eas_uid=${easUid}`);
}

/**
 * Register ENSIP-25 text records for a new agent node.
 * Sets axl_pubkey, capabilities, and initial discovery count.
 */
export async function registerAgentNode(
  ensName: string,
  axlPubkey: string,
  capabilities: string
): Promise<void> {
  console.log(`[ens] Registering ${ensName}...`);
  await setTextRecord(ensName, 'axl_pubkey',        axlPubkey);
  await setTextRecord(ensName, 'capabilities',      capabilities);
  await setTextRecord(ensName, 'discoveries_count', '0');
  await setTextRecord(ensName, 'agent_type',        'simoproof-discovery-node');
  await setTextRecord(ensName, 'protocol_version',  '3.0');
  console.log(`[ens] ${ensName} registered with ENSIP-25 records`);
}
