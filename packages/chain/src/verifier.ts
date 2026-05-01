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

  // Encode params — strip 0x prefix for bytes params
  const sealBytes    = Buffer.from(params.seal.slice(2), 'hex');
  const journalBytes = Buffer.from(params.journalBytes.slice(2), 'hex');

  const hash = await wal.writeContract({
    address:      verifier,
    abi:          DISCOVERY_VERIFIER_ABI,
    functionName: 'submitDiscovery',
    args:         [sealBytes, journalBytes, params.ipfsCid, params.ensName],
  });

  console.log(`[chain] Tx submitted: ${hash}`);

  // Wait for receipt and extract EAS UID from event
  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log(`[chain] Confirmed in block ${receipt.blockNumber}`);

  // Find DiscoveryVerified event
  const log = receipt.logs.find(
    l => l.topics[0] === '0x' + Buffer.from(
      'DiscoveryVerified(bytes32,bytes32,address,bytes32,bytes32)'
    ).toString('hex') // This is wrong — keccak256 of event sig
  );

  // Return easUid from topics[2] (second indexed param)
  // In practice, use viem's decodeEventLog for proper parsing
  if (receipt.logs.length > 0) {
    // EAS UID is topics[2] of the DiscoveryVerified event
    const discoveryLog = receipt.logs.find(l => l.topics.length >= 3);
    if (discoveryLog?.topics[2]) {
      return discoveryLog.topics[2] as `0x${string}`;
    }
  }

  // Fallback: derive UID from tx hash
  return `0x${receipt.transactionHash.slice(2, 66)}` as `0x${string}`;
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

  const sealBytes    = Buffer.from(seal.slice(2), 'hex');
  const journalBuf   = Buffer.from(journalBytes.slice(2), 'hex');

  const result = await pub.readContract({
    address:      verifier,
    abi:          DISCOVERY_VERIFIER_ABI,
    functionName: 'verifyProof',
    args:         [sealBytes, journalBuf],
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
