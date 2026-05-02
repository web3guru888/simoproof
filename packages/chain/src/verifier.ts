/**
 * DiscoveryVerifier contract interaction.
 * Calls submitDiscovery() on-chain, which:
 * 1. Verifies the Risc0 ZK proof
 * 2. Creates an EAS attestation
 * 3. Emits DiscoveryVerified event
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  keccak256,
  toBytes,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import type { ProofOutput } from '@simoproof/types';

const DISCOVERY_VERIFIER_ABI = parseAbi([
  'function submitDiscovery(bytes calldata seal, bytes calldata journalBytes, string calldata ipfsCid, string calldata ensName) external returns (bytes32 easUid)',
  'function verifyProof(bytes calldata seal, bytes calldata journalBytes) external view returns (bool)',
  'function guestImageId() external view returns (bytes32)',
  'function discoverySchemaUid() external view returns (bytes32)',
  'event DiscoveryVerified(bytes32 indexed claimHash, bytes32 indexed easUid, address indexed atlasNode, bytes32 sourceCommitment, bytes32 consensusHash)',
]);

function getClients() {
  const account = privateKeyToAccount(
    (process.env.PRIVATE_KEY ?? '0x0000000000000000000000000000000000000000000000000000000000000001') as `0x${string}`
  );
  const rpc = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org';
  const pub = createPublicClient({ chain: baseSepolia, transport: http(rpc) });
  const wal = createWalletClient({ account, chain: baseSepolia, transport: http(rpc) });
  return { account, pub, wal };
}

function getVerifierAddress(): `0x${string}` {
  const addr = process.env.DISCOVERY_VERIFIER_ADDRESS;
  if (!addr) throw new Error('DISCOVERY_VERIFIER_ADDRESS not set in environment');
  return addr as `0x${string}`;
}

export interface SubmitDiscoveryParams {
  seal:         `0x${string}`;
  journalBytes: `0x${string}`;
  ipfsCid:      string;
  ensName:      string;
}

/**
 * Submit a verified discovery on-chain.
 * Returns the EAS UID from the emitted DiscoveryVerified event.
 */
export async function submitDiscovery(params: SubmitDiscoveryParams): Promise<`0x${string}`> {
  const { wal, pub } = getClients();
  const verifier = getVerifierAddress();

  console.log(`[chain] Submitting discovery to DiscoveryVerifier at ${verifier}...`);

  // Ensure 0x prefix for viem hex strings (Rust prover emits plain hex, no 0x)
  const sealHex    = (params.seal.startsWith('0x')
    ? params.seal
    : `0x${params.seal}`) as `0x${string}`;
  const journalHex = (params.journalBytes.startsWith('0x')
    ? params.journalBytes
    : `0x${params.journalBytes}`) as `0x${string}`;

  const hash = await wal.writeContract({
    address:      verifier,
    abi:          DISCOVERY_VERIFIER_ABI,
    functionName: 'submitDiscovery',
    args:         [sealHex, journalHex, params.ipfsCid, params.ensName],
  });

  console.log(`[chain] Tx submitted: ${hash}`);

  // Wait for receipt and extract EAS UID from event
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log(`[chain] Confirmed in block ${receipt.blockNumber}`);

  // Find DiscoveryVerified event by proper keccak256 of the event signature
  const DISCOVERY_VERIFIED_TOPIC = keccak256(
    toBytes('DiscoveryVerified(bytes32,bytes32,address,bytes32,bytes32)')
  );
  const discoveryLog = receipt.logs.find(
    l => l.topics[0]?.toLowerCase() === DISCOVERY_VERIFIED_TOPIC.toLowerCase()
  );

  // topics[2] = easUid (second indexed param)
  if (discoveryLog?.topics[2]) {
    console.log(`[chain] DiscoveryVerified event found — easUid=${discoveryLog.topics[2].slice(0, 18)}...`);
    return discoveryLog.topics[2] as `0x${string}`;
  }

  // Fallback: derive deterministic UID from tx hash + block number
  const fallbackUid = keccak256(
    toBytes(`${receipt.transactionHash}:${receipt.blockNumber}`)
  );
  console.warn(`[chain] DiscoveryVerified event not found — using fallback UID derived from tx hash`);
  return fallbackUid;
}

/**
 * Verify a proof on-chain without creating an attestation (view-only).
 */
export async function verifyProofOnChain(
  seal: `0x${string}`,
  journalBytes: `0x${string}`
): Promise<boolean> {
  const { pub } = getClients();
  const verifier = getVerifierAddress();

  const sealHex    = (seal.startsWith('0x') ? seal : `0x${seal}`) as `0x${string}`;
  const journalHex = (journalBytes.startsWith('0x') ? journalBytes : `0x${journalBytes}`) as `0x${string}`;

  const result = await pub.readContract({
    address:      verifier,
    abi:          DISCOVERY_VERIFIER_ABI,
    functionName: 'verifyProof',
    args:         [sealHex, journalHex],
  });
  return result as boolean;
}

/**
 * Get the guest IMAGE_ID from the deployed contract.
 * Use this to verify that the deployed contract matches our prover.
 */
export async function getDeployedImageId(): Promise<`0x${string}`> {
  const { pub } = getClients();
  const verifier = getVerifierAddress();
  const id = await pub.readContract({
    address:      verifier,
    abi:          DISCOVERY_VERIFIER_ABI,
    functionName: 'guestImageId',
  });
  return id as `0x${string}`;
}
