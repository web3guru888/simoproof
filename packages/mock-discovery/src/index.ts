import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { DiscoveryRecord } from '@simoproof/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load fixtures from JSON
const fixturesPath = join(__dirname, '..', 'fixtures', 'discoveries.json');
const fixturesRaw = JSON.parse(readFileSync(fixturesPath, 'utf8')) as Array<{
  id: string;
  claim: string;
  source_url: string;
  source_description: string;
  raw_source_bytes: string;  // base64
  confidence: number;
  causal_summary: string;
}>;

function buildRecord(f: typeof fixturesRaw[0], timestamp?: number): DiscoveryRecord {
  const rawBytes = Buffer.from(f.raw_source_bytes, 'base64');
  const sourceHash = Array.from(createHash('sha256').update(rawBytes).digest()) as number[];
  const claimHash  = Array.from(createHash('sha256').update(f.claim, 'utf8').digest()) as number[];

  return {
    id: f.id,
    claim: f.claim,
    claimHash,
    rawSourceBytes:  [rawBytes],
    apiSourceHashes: [sourceHash],
    confidence:      f.confidence,
    causalSummary:   f.causal_summary,
    sourceDescription: f.source_description,
    timestamp:       timestamp ?? Math.floor(Date.now() / 1000),
    status:          'pending',
  };
}

/** Return all 5 fixture discoveries */
export function getDiscoveries(): DiscoveryRecord[] {
  return fixturesRaw.map(f => buildRecord(f));
}

/** Return a single fixture discovery by ID */
export function getDiscovery(id: string): DiscoveryRecord | undefined {
  const f = fixturesRaw.find(x => x.id === id);
  return f ? buildRecord(f) : undefined;
}

/**
 * Fetch real live data from the World Bank API.
 * Used when --live flag is passed to the pipeline.
 */
export async function fetchLiveDiscovery(
  country: string,
  indicator: string
): Promise<DiscoveryRecord> {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&mrv=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank API returned ${res.status}: ${url}`);
  const rawBytes = Buffer.from(await res.text());
  const sourceHash = Array.from(createHash('sha256').update(rawBytes).digest()) as number[];

  // Parse value from World Bank JSON structure: [[meta], [records]]
  let latestValue: number | string = 'unknown';
  try {
    const data = JSON.parse(rawBytes.toString()) as Array<unknown>;
    const records = data[1] as Array<{ value: number; date: string }>;
    latestValue = records?.[0]?.value ?? 'unknown';
  } catch { /* leave as unknown */ }

  const claim = `World Bank ${indicator} for ${country}: ${latestValue} (latest available, fetched ${new Date().toISOString().slice(0, 10)})`;
  const claimHash = Array.from(createHash('sha256').update(claim, 'utf8').digest()) as number[];

  return {
    id: `live-${Date.now()}`,
    claim,
    claimHash,
    rawSourceBytes:  [rawBytes],
    apiSourceHashes: [sourceHash],
    confidence:      0.85,
    causalSummary:   `live-api → ${indicator} (0.85)`,
    sourceDescription: url,
    timestamp:       Math.floor(Date.now() / 1000),
    status:          'pending',
  };
}

/** List all available fixture IDs */
export function listDiscoveryIds(): string[] {
  return fixturesRaw.map(f => f.id);
}
