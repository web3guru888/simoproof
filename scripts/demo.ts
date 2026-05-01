/**
 * SimoProof Demo Script — runs the full pipeline for all 5 fixture discoveries.
 * Pre-generates all proofs so the 3-minute demo video runs smoothly.
 *
 * Usage: npx tsx scripts/demo.ts [--discovery disc-001] [--all] [--skip-onchain]
 */
import 'dotenv/config';
import { runPipeline } from '@simoproof/api';

const args       = process.argv.slice(2);
const runAll     = args.includes('--all');
const skipOnChain = args.includes('--skip-onchain');
const singleId   = args.includes('--discovery')
  ? args[args.indexOf('--discovery') + 1]
  : 'disc-001';

const discoveryIds = runAll
  ? ['disc-001', 'disc-002', 'disc-003', 'disc-004', 'disc-005']
  : [singleId];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SimoProof v3 — Verified Discovery Network Demo');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = [];

  for (const id of discoveryIds) {
    console.log(`\n▶ Running pipeline for: ${id}`);
    console.log('─'.repeat(55));

    try {
      const result = await runPipeline({
        discoveryId: id,
        skipOnChain,
      });

      console.log('\n✅ Pipeline complete!');
      console.log(`   Claim:       ${result.claim.slice(0, 70)}...`);
      console.log(`   EAS UID:     ${result.attestation.easUid}`);
      console.log(`   0G CID:      ${result.attestation.ipfsCid.slice(0, 32)}...`);
      console.log(`   Duration:    ${(result.durationMs / 1000).toFixed(1)}s`);
      console.log(`   Conf met:    ${result.proof.confidenceMet}`);
      console.log(`   Consensus:   ${result.proof.consensusMet} (${result.simocracy.voteCount}/4)`);
      console.log(`   ENS updated: ${result.ensUpdated}`);

      results.push({ id, success: true, result });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`\n❌ Pipeline failed: ${msg}`);
      results.push({ id, success: false, error: msg });
    }
  }

  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  DEMO SUMMARY');
  console.log('═══════════════════════════════════════════════════════');

  const succeeded = results.filter(r => r.success);
  const failed    = results.filter(r => !r.success);

  console.log(`\n✅ Succeeded: ${succeeded.length}/${results.length}`);
  for (const r of succeeded) {
    const res = r.result!;
    console.log(`   ${r.id}: EAS ${res.attestation.easUid.slice(0, 18)}...`);
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
    for (const r of failed) {
      console.log(`   ${r.id}: ${r.error}`);
    }
  }

  console.log('\n🎬 Demo script done. See EAS attestations at:');
  console.log('   https://base-sepolia.easscan.org/\n');
}

main().catch(console.error);
