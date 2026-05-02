/**
 * SimoProof Link Checker — uses curl to fetch page, then checks all hrefs
 * Usage: npx tsx e2e/link-check.ts
 */
import { execSync } from 'child_process';

const BASE = 'https://simoproof.org';
const TIMEOUT = 15; // seconds per request

interface LinkResult {
  url: string;
  status: number | string;
  ok: boolean;
  note?: string;
}

function curlStatus(url: string): number | string {
  try {
    const out = execSync(
      `curl -o /dev/null -s -w "%{http_code}" --max-time ${TIMEOUT} --location "${url}"`,
      { timeout: (TIMEOUT + 5) * 1000 }
    ).toString().trim();
    return parseInt(out, 10) || out;
  } catch (e: any) {
    return `ERR: ${e.message?.slice(0, 60)}`;
  }
}

async function main() {
  console.log(`\n🔍 SimoProof Live Link Checker — ${BASE}\n`);

  // 1. Fetch the page HTML
  console.log('── Fetching page HTML...');
  let html: string;
  try {
    html = execSync(`curl -s --max-time 30 "${BASE}"`, { timeout: 35000 }).toString();
    console.log(`   ✅ Page fetched (${(html.length / 1024).toFixed(1)} KB)\n`);
  } catch (e: any) {
    console.error('   ❌ Failed to fetch page:', e.message);
    process.exit(1);
  }

  // 2. Extract all href values
  const hrefRegex = /href="([^"]+)"/g;
  const hrefs = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = hrefRegex.exec(html)) !== null) {
    const h = m[1];
    if (h.startsWith('http') || h.startsWith('#')) hrefs.add(h);
    else if (h.startsWith('/')) hrefs.add(BASE + h);
  }

  console.log(`── Found ${hrefs.size} unique links\n`);

  // 3. Categorise
  const internal: string[] = [];
  const external: string[] = [];
  for (const h of hrefs) {
    if (h.startsWith('#')) internal.push(h);
    else external.push(h);
  }

  // 4. Check internal anchors exist in the HTML
  console.log('── Internal anchor checks:');
  for (const anchor of internal) {
    const id = anchor.slice(1); // strip #
    const present = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
    const icon = present ? '✅' : '❌';
    console.log(`   ${icon} ${anchor}${present ? '' : '  ← ANCHOR NOT FOUND IN DOM'}`);
  }

  // 5. Check external URLs
  console.log('\n── External URL checks (live HTTP):');
  const results: LinkResult[] = [];
  for (const url of external) {
    const status = curlStatus(url);
    const ok = typeof status === 'number' && status >= 200 && status < 400;
    const icon = ok ? '✅' : (typeof status === 'number' && status >= 400 ? '❌' : '⚠️');
    let note = '';

    // Flag wrong ETHGlobal link
    if (url.includes('ethglobal.com/events/agents') && !url.includes('openagents')) {
      note = ' ← WRONG: should be /events/openagents';
    }

    results.push({ url, status, ok, note });
    console.log(`   ${icon} [${status}] ${url}${note}`);
  }

  // 6. Specific checks
  console.log('\n── Specific validation checks:');

  const checks = [
    {
      name: 'ETHGlobal link uses /events/openagents',
      pass: html.includes('ethglobal.com/events/openagents'),
      fail: html.includes('ethglobal.com/events/agents"') ? 'Found /events/agents instead' : 'Link not found',
    },
    {
      name: 'Prize Target stat removed from header',
      pass: !html.includes('Prize Target'),
      fail: 'Prize Target still present in HTML',
    },
    {
      name: 'Verified Discoveries stat present',
      pass: html.includes('Verified Discoveries'),
      fail: 'Missing',
    },
    {
      name: 'Senate Agents stat present',
      pass: html.includes('Senate Agents'),
      fail: 'Missing',
    },
    {
      name: 'Pipeline Steps stat present',
      pass: html.includes('Pipeline Steps'),
      fail: 'Missing',
    },
    {
      name: 'Prize Tracks section still at bottom',
      pass: html.includes('Prize Tracks'),
      fail: 'Prize Tracks section missing',
    },
    {
      name: 'GitHub link to correct repo',
      pass: html.includes('github.com/web3guru888/simoproof'),
      fail: 'Missing',
    },
    {
      name: 'EAS Schema link present',
      pass: html.includes('easscan.org'),
      fail: 'Missing',
    },
    {
      name: 'ENS App link present',
      pass: html.includes('app.ens.domains'),
      fail: 'Missing',
    },
    {
      name: 'Run Interactive Demo CTA present',
      pass: html.includes('Run Interactive Demo'),
      fail: 'Missing',
    },
  ];

  let passed = 0; let failed = 0;
  for (const c of checks) {
    const icon = c.pass ? '✅' : '❌';
    console.log(`   ${icon} ${c.name}${c.pass ? '' : `  ← ${c.fail}`}`);
    if (c.pass) passed++; else failed++;
  }

  // 7. Summary
  const badLinks = results.filter(r => !r.ok);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUMMARY`);
  console.log(`  Specific checks : ${passed}/${checks.length} passed`);
  console.log(`  External links  : ${results.filter(r=>r.ok).length}/${results.length} OK`);
  if (badLinks.length) {
    console.log(`  ❌ Bad links:`);
    for (const b of badLinks) console.log(`     [${b.status}] ${b.url}`);
  }
  console.log(`${'═'.repeat(60)}\n`);

  process.exit(failed > 0 || badLinks.length > 0 ? 1 : 0);
}

main();
