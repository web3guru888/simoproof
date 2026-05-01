/**
 * Verify any EAS UID on-chain to demonstrate proof validity.
 *
 * Usage: npx tsx scripts/verify.ts --eas-uid 0x...
 */
import 'dotenv/config';
import { getAttestation } from '@simoproof/chain';
import { verifyProofOnChain } from '@simoproof/chain';

const args   = process.argv.slice(2);
const uidArg = args.indexOf('--eas-uid');
if (uidArg === -1 || !args[uidArg + 1]) {
  console.error('Usage: npx tsx scripts/verify.ts --eas-uid 0x...');
  process.exit(1);
}
const easUid = args[uidArg + 1] as `0x${string}`;

async function main() {
  console.log(`\n🔍 Verifying EAS UID: ${easUid}\n`);

  // 1. Fetch attestation from EAS Scan
  const attestation = await getAttestation(easUid);
  if (!attestation) {
    console.error('❌ Attestation not found on EAS Scan');
    process.exit(1);
  }

  console.log('📋 Attestation found:');
  console.log(`   Attester:   ${attestation.attester}`);
  console.log(`   Recipient:  ${attestation.recipient}`);
  console.log(`   Time:       ${new Date(attestation.time * 1000).toISOString()}`);
  console.log(`   Tx:         ${attestation.txid}`);
  console.log(`   Revoked:    ${attestation.revoked}`);

  if (attestation.decodedDataJson) {
    const decoded = JSON.parse(attestation.decodedDataJson) as Array<{ name: string; value: unknown }>;
    console.log('\n🔐 Decoded fields:');
    for (const field of decoded) {
      const val = typeof field.value === 'string' ? field.value.slice(0, 40) + '...' : field.value;
      console.log(`   ${field.name}: ${val}`);
    }
  }

  // 2. Verify proof on-chain (if verifier address is set)
  if (process.env.DISCOVERY_VERIFIER_ADDRESS) {
    const decoded = JSON.parse(attestation.decodedDataJson ?? '[]') as Array<{ name: string; value: unknown }>;
    const sealEntry    = decoded.find(d => d.name === 'zk_proof');
    const journalEntry = decoded.find(d => d.name === 'journal_bytes');

    if (sealEntry?.value && journalEntry?.value) {
      try {
        const valid = await verifyProofOnChain(
          sealEntry.value as `0x${string}`,
          journalEntry.value as `0x${string}`
        );
        console.log(`\n${valid ? '✅' : '❌'} On-chain proof verification: ${valid ? 'VALID' : 'INVALID'}`);
      } catch (e) {
        console.log(`\n⚠️  On-chain verification failed: ${e}`);
      }
    } else {
      console.log('\n⚠️  Could not extract proof bytes from attestation data');
    }
  } else {
    console.log('\n⚠️  DISCOVERY_VERIFIER_ADDRESS not set — skipping on-chain proof check');
    console.log('   (Deploy the contract first, then re-run)');
  }

  console.log('\n✅ Verification complete\n');
}

main().catch(console.error);
