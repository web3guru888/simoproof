/**
 * SimoProof Live E2E Tests — simoproof.org
 * Run: npx playwright test e2e/live-test.spec.ts --reporter=list
 */
import { test, expect, Page } from '@playwright/test';

const BASE = 'https://simoproof.org';

test.describe('SimoProof.org — Live E2E', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ── Page loads ────────────────────────────────────────────────────────────
  test('page loads with correct title', async () => {
    await expect(page).toHaveTitle(/SimoProof/i);
  });

  // ── Navigation links ──────────────────────────────────────────────────────
  test('nav links present and correct', async () => {
    const links = page.locator('nav a');
    const hrefs: string[] = [];
    for (const link of await links.all()) {
      hrefs.push(await link.getAttribute('href') || '');
    }
    console.log('NAV LINKS:', hrefs);

    // ETHGlobal pill must link to openagents (not /agents)
    const ethLink = page.locator('nav a[href*="ethglobal"]');
    await expect(ethLink).toBeVisible();
    const href = await ethLink.getAttribute('href');
    console.log('ETHGlobal href:', href);
    expect(href).toContain('openagents');
    expect(href).not.toContain('/events/agents"');
  });

  // ── No Prize Target in stat strip ─────────────────────────────────────────
  test('stat strip does NOT contain Prize Target', async () => {
    const prizeTargetLabel = page.locator('.stat-lbl', { hasText: 'Prize Target' });
    await expect(prizeTargetLabel).toHaveCount(0);
  });

  // ── Stat strip items check ────────────────────────────────────────────────
  test('stat strip has expected labels', async () => {
    const labels = await page.locator('.stat-lbl').allTextContents();
    console.log('STAT LABELS:', labels);
    expect(labels).toContain('Verified Discoveries');
    expect(labels).toContain('Senate Agents');
    expect(labels).toContain('Pipeline Steps');
  });

  // ── Hero section ──────────────────────────────────────────────────────────
  test('hero section visible with buttons', async () => {
    await expect(page.locator('text=Run Interactive Demo')).toBeVisible();
    await expect(page.locator('text=View Source')).toBeVisible();
  });

  // ── External links reachability (spot-check) ─────────────────────────────
  test('GitHub link points to correct repo', async () => {
    const ghLinks = page.locator('a[href*="github.com/web3guru888/simoproof"]');
    const count = await ghLinks.count();
    console.log(`GitHub links found: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('EAS Schema link present', async () => {
    const easLink = page.locator('a[href*="easscan.org"]').first();
    await expect(easLink).toBeVisible();
    const href = await easLink.getAttribute('href');
    console.log('EAS link:', href);
    expect(href).toContain('0x86704ade90c66f1fc5071d0a00e8d0c5048d8ae2d7866cf55b3a319a2');
  });

  test('ENS App link present', async () => {
    const ensLink = page.locator('a[href*="app.ens.domains"]').first();
    await expect(ensLink).toBeVisible();
    const href = await ensLink.getAttribute('href');
    console.log('ENS link:', href);
    expect(href).toContain('simoproof.eth');
  });

  // ── Sections presence ─────────────────────────────────────────────────────
  test('prize tracks section present at bottom', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const prizeSection = page.locator('.section-title', { hasText: /ETHGlobal Open Agents/i });
    await expect(prizeSection).toBeVisible();
  });

  test('attestation feed section present', async () => {
    const feedSection = page.locator('#feed');
    await expect(feedSection).toBeVisible();
  });
});
