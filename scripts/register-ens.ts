/**
 * register-ens.ts
 * Registers `simoproof.eth` on Sepolia, then creates `node-1.simoproof.eth`.
 * Uses the new ENS ETHRegistrarController ABI (tuple-based Registration struct).
 *
 * Usage:  npx tsx scripts/register-ens.ts
 */

import { createPublicClient, createWalletClient, http, namehash, labelhash } from 'viem';
import { sepolia }             from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv             from 'dotenv';
dotenv.config();

// ── Official Sepolia ENS deployments (docs.ens.domains/learn/deployments) ───
const ENS_REGISTRY             = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as `0x${string}`;
const ETH_REGISTRAR_CONTROLLER = '0xfb3cE5D01e0f33f41DbB39035dB9745962F1f968' as `0x${string}`;
const PUBLIC_RESOLVER          = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as `0x${string}`;

const PARENT_LABEL  = 'simoproof';
const PARENT_NAME   = 'simoproof.eth';
const SUBNAME_LABEL = 'node-1';
const FULL_SUBNAME  = 'node-1.simoproof.eth';
const DURATION      = 365n * 24n * 3600n;   // 1 year

// ── ABIs ─────────────────────────────────────────────────────────────────────
const CONTROLLER_ABI = [
  {
    name: 'available', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'label', type: 'string' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'rentPrice', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'label', type: 'string' }, { name: 'duration', type: 'uint256' }],
    outputs: [{ name: 'price', type: 'tuple', components: [
      { name: 'base', type: 'uint256' }, { name: 'premium', type: 'uint256' },
    ]}],
  },
  {
    name: 'minCommitmentAge', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }],
  },
  {
    name: 'makeCommitment', type: 'function', stateMutability: 'pure',
    inputs: [{
      name: 'registration', type: 'tuple', components: [
        { name: 'label',         type: 'string'  },
        { name: 'owner',         type: 'address' },
        { name: 'duration',      type: 'uint256' },
        { name: 'secret',        type: 'bytes32' },
        { name: 'resolver',      type: 'address' },
        { name: 'data',          type: 'bytes[]' },
        { name: 'reverseRecord', type: 'uint8'   },
        { name: 'referrer',      type: 'bytes32' },
      ],
    }],
    outputs: [{ name: 'commitment', type: 'bytes32' }],
  },
  {
    name: 'commit', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'commitment', type: 'bytes32' }], outputs: [],
  },
  {
    name: 'register', type: 'function', stateMutability: 'payable',
    inputs: [{
      name: 'registration', type: 'tuple', components: [
        { name: 'label',         type: 'string'  },
        { name: 'owner',         type: 'address' },
        { name: 'duration',      type: 'uint256' },
        { name: 'secret',        type: 'bytes32' },
        { name: 'resolver',      type: 'address' },
        { name: 'data',          type: 'bytes[]' },
        { name: 'reverseRecord', type: 'uint8'   },
        { name: 'referrer',      type: 'bytes32' },
      ],
    }],
    outputs: [],
  },
] as const;

const REGISTRY_ABI = [
  {
    name: 'owner', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }], outputs: [{ type: 'address' }],
  },
  {
    name: 'setSubnodeRecord', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'node',     type: 'bytes32' },
      { name: 'label',    type: 'bytes32' },
      { name: 'owner',    type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'ttl',      type: 'uint64'  },
    ], outputs: [],
  },
] as const;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  const rpc        = process.env.SEPOLIA_RPC ?? 'https://ethereum-sepolia-rpc.publicnode.com';

  const account = privateKeyToAccount(privateKey);
  const pub  = createPublicClient({ chain: sepolia, transport: http(rpc) });
  const wal  = createWalletClient({ account, chain: sepolia, transport: http(rpc) });

  console.log(`\n🔑 Account: ${account.address}`);
  const balance = await pub.getBalance({ address: account.address });
  console.log(`💰 Balance: ${(Number(balance) / 1e18).toFixed(6)} ETH\n`);

  // ── Check availability ───────────────────────────────────────────────────
  const isAvailable  = await pub.readContract({ address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'available', args: [PARENT_LABEL] });
  const parentNode   = namehash(PARENT_NAME);
  const currentOwner = await pub.readContract({ address: ENS_REGISTRY, abi: REGISTRY_ABI, functionName: 'owner', args: [parentNode] }) as string;
  console.log(`📛 ${PARENT_NAME} available: ${isAvailable}`);
  console.log(`👤 Current registry owner:  ${currentOwner}`);

  const weOwnIt = currentOwner.toLowerCase() === account.address.toLowerCase();

  // ── Register if needed ──────────────────────────────────────────────────
  if (!weOwnIt && isAvailable) {
    const price = await pub.readContract({
      address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI,
      functionName: 'rentPrice', args: [PARENT_LABEL, DURATION],
    }) as { base: bigint; premium: bigint };
    const totalPrice = price.base + price.premium;
    const withBuffer = (totalPrice * 110n) / 100n;
    console.log(`💸 Price: ${(Number(totalPrice)/1e18).toFixed(6)} ETH  (sending ${(Number(withBuffer)/1e18).toFixed(6)} ETH)\n`);

    // Random 32-byte secret
    const secretBytes = crypto.getRandomValues(new Uint8Array(32));
    const secret = `0x${Array.from(secretBytes).map(b => b.toString(16).padStart(2,'0')).join('')}` as `0x${string}`;
    const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

    const registration = {
      label:         PARENT_LABEL,
      owner:         account.address as `0x${string}`,
      duration:      DURATION,
      secret,
      resolver:      PUBLIC_RESOLVER,
      data:          [] as `0x${string}`[],
      reverseRecord: 0 as unknown as never,
      referrer:      ZERO_BYTES32,
    };

    const commitment = await pub.readContract({
      address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI,
      functionName: 'makeCommitment', args: [registration],
    });
    console.log(`📝 Commitment: ${commitment}`);

    console.log('⏳ Submitting commitment...');
    const commitHash = await wal.writeContract({
      address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI,
      functionName: 'commit', args: [commitment],
    });
    console.log(`   tx: ${commitHash}`);
    await pub.waitForTransactionReceipt({ hash: commitHash });
    console.log('   ✅ Commitment confirmed');

    const minAge = await pub.readContract({ address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI, functionName: 'minCommitmentAge' }) as bigint;
    const waitSec = Number(minAge) + 5;
    console.log(`\n⏳ Waiting ${waitSec}s for commitment to mature...`);
    for (let remaining = waitSec; remaining > 0; remaining -= 5) {
      process.stdout.write(`   ${remaining}s remaining...\r`);
      await sleep(5000);
    }
    console.log('\n');

    console.log('📤 Registering name...');
    const regHash = await wal.writeContract({
      address: ETH_REGISTRAR_CONTROLLER, abi: CONTROLLER_ABI,
      functionName: 'register', args: [registration], value: withBuffer,
    });
    console.log(`   tx: ${regHash}`);
    await pub.waitForTransactionReceipt({ hash: regHash });
    console.log(`   ✅ ${PARENT_NAME} registered!\n`);

  } else if (weOwnIt) {
    console.log(`✅ Already own ${PARENT_NAME} — skipping registration\n`);
  } else {
    console.error(`❌ ${PARENT_NAME} is taken and not by us. Try a different name.`);
    process.exit(1);
  }

  // ── Create subname node-1.simoproof.eth ─────────────────────────────────
  console.log(`🔧 Creating subname ${FULL_SUBNAME}...`);
  const subHash = await wal.writeContract({
    address: ENS_REGISTRY, abi: REGISTRY_ABI,
    functionName: 'setSubnodeRecord',
    args: [ parentNode, labelhash(SUBNAME_LABEL), account.address, PUBLIC_RESOLVER, 0n ],
  });
  console.log(`   tx: ${subHash}`);
  await pub.waitForTransactionReceipt({ hash: subHash });

  // ── Verify ────────────────────────────────────────────────────────────────
  const subNode  = namehash(FULL_SUBNAME);
  const subOwner = await pub.readContract({ address: ENS_REGISTRY, abi: REGISTRY_ABI, functionName: 'owner', args: [subNode] }) as string;
  console.log(`\n✅ ${FULL_SUBNAME} owner: ${subOwner}`);

  if (subOwner.toLowerCase() === account.address.toLowerCase()) {
    console.log(`\n🎉 Done! Add to .env:\n`);
    console.log(`   ENS_SUBNAME=${FULL_SUBNAME}`);
  } else {
    console.log(`\n⚠️  Subname not owned by us (${subOwner}) — check parent name ownership`);
  }
}

main().catch(e => { console.error(e.shortMessage ?? e.message ?? e); process.exit(1); });
