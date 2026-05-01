/**
 * SimoProof API Server — Express HTTP server exposing the pipeline.
 * Also mounts the MCP server on /mcp for KeeperHub integration.
 */
import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import { runPipeline } from './pipeline.js';
import { listDiscoveryIds } from '@simoproof/mock-discovery';
import { getAttestation, listAttestationsBySchema } from '@simoproof/chain';
import { retrieveDiscovery } from '@simoproof/storage';
import { createMcpServer } from '@simoproof/keeperhub';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const app  = express();
const port = parseInt(process.env.PORT ?? '3000');

app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.path}`);
  next();
});

// ── Health check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    version:   '3.0.0',
    timestamp: new Date().toISOString(),
    envCheck: {
      hasPrivateKey:    !!process.env.PRIVATE_KEY,
      hasOpenAIKey:     !!process.env.OPENAI_API_KEY,
      hasBonsaiKey:     !!process.env.BONSAI_API_KEY,
      risc0DevMode:     process.env.RISC0_DEV_MODE === 'true',
      hasKeeperHubKey:  !!process.env.KEEPERHUB_API_KEY,
      ensSubname:       process.env.ENS_SUBNAME ?? 'not set',
      verifierAddress:  process.env.DISCOVERY_VERIFIER_ADDRESS ?? 'not deployed',
    },
  });
});

// ── List available discoveries ────────────────────────────────────────────
app.get('/api/discoveries', (_req, res) => {
  const ids = listDiscoveryIds();
  res.json({ discoveries: ids, count: ids.length });
});

// ── Submit a discovery through the full pipeline ───────────────────────────
app.post('/api/discovery/submit', async (req: Request, res: Response) => {
  const {
    discoveryId  = 'disc-001',
    useLiveData  = false,
    liveCountry  = 'TH',
    liveIndicator = 'EN.ATM.CO2E.PC',
    skipOnChain  = false,
  } = req.body as Record<string, unknown>;

  try {
    const result = await runPipeline({
      discoveryId:   discoveryId as string,
      useLiveData:   useLiveData as boolean,
      liveCountry:   liveCountry as string,
      liveIndicator: liveIndicator as string,
      skipOnChain:   skipOnChain as boolean,
    });
    res.json({ success: true, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[api] Pipeline error: ${msg}`);
    res.status(400).json({ success: false, error: msg });
  }
});

// ── Get attestation by EAS UID ────────────────────────────────────────────
app.get('/api/discovery/:easUid/proof', async (req: Request, res: Response) => {
  try {
    const attestation = await getAttestation(req.params.easUid as `0x${string}`);
    if (!attestation) {
      res.status(404).json({ error: 'Attestation not found' });
      return;
    }
    res.json(attestation);
  } catch (e: unknown) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Retrieve full discovery package from 0G ───────────────────────────────
app.get('/api/discovery/:easUid/package', async (req: Request, res: Response) => {
  try {
    const attestation = await getAttestation(req.params.easUid as `0x${string}`);
    if (!attestation) {
      res.status(404).json({ error: 'Attestation not found' });
      return;
    }
    // Parse ipfs_cid from decodedDataJson
    const decoded = JSON.parse(attestation.decodedDataJson ?? '[]') as Array<{ name: string; value: unknown }>;
    const cidEntry = decoded.find(d => d.name === 'ipfs_cid');
    if (!cidEntry?.value) {
      res.status(404).json({ error: 'No 0G CID in attestation' });
      return;
    }
    const pkg = await retrieveDiscovery(cidEntry.value as string);
    res.json(pkg);
  } catch (e: unknown) {
    res.status(500).json({ error: String(e) });
  }
});

// ── List recent attestations ──────────────────────────────────────────────
app.get('/api/attestations', async (req: Request, res: Response) => {
  const schemaUid = process.env.DISCOVERY_SCHEMA_UID as `0x${string}` | undefined;
  if (!schemaUid) {
    res.status(400).json({ error: 'DISCOVERY_SCHEMA_UID not set' });
    return;
  }
  try {
    const attestations = await listAttestationsBySchema(schemaUid, 10);
    res.json({ attestations, count: attestations.length });
  } catch (e: unknown) {
    res.status(500).json({ error: String(e) });
  }
});

// ── MCP server mount (for KeeperHub) ─────────────────────────────────────
// KeeperHub calls POST /mcp with JSON-RPC 2.0 bodies
const mcpServer = createMcpServer();
app.all('/mcp', async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => `session-${Date.now()}`,
  });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// ── Error handler ─────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api] Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🔍 SimoProof API v3.0.0 running on http://localhost:${port}`);
  console.log(`   POST /api/discovery/submit   — run pipeline`);
  console.log(`   GET  /api/discoveries         — list fixture IDs`);
  console.log(`   GET  /api/discovery/:uid/proof — get EAS attestation`);
  console.log(`   POST /mcp                      — MCP endpoint (KeeperHub)`);
  console.log(`   GET  /health                   — health check\n`);
});
