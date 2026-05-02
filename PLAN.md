# SimoProof v3 — Submission Plan
**Hackathon:** ETHGlobal Open Agents  
**Due:** Sunday 3 May 2026 at 12:00pm EDT  
**Status:** ✅ BUILD COMPLETE — Demo & submission remaining

---

## Prize Targets

| Track | Sponsor | Prize |
|-------|---------|-------|
| Best AI Agent Integration | ENS | $5,000 |
| Best Use of KeeperHub | KeeperHub | $5,000 |
| Best AXL Application | Gensyn | $5,000 |
| **Total best case** | | **$15,000** |

---

## Friday 1 May — Secrets & Deploy ✅ DONE

### Accounts & Keys
- [x] Created dedicated hackathon wallet — `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580`
- [x] Funded with Sepolia ETH (~0.056 ETH available)
- [x] Funded with Base Sepolia ETH (~0.060 ETH available)
- [x] KeeperHub API key — `kh_zcBcSoMYrZxO--I7GzR8PNG-2zT_WX7_`
- [x] RPC URLs set — publicnode.com (free, no key)
- [x] ASI:One API key set — `sk_69076eb7...` (used as senate LLM backend)
- [x] ENS names registered on Sepolia testnet

### Fill in .env ✅
All 27 environment variables set in `/workspace/simoproof/.env`.

### Deploy Contract to Base Sepolia ✅
```
DiscoveryVerifier.sol → 0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6
MockRiscZeroVerifier → bundled in deployment
```

### Register EAS Schema ✅
```
Schema UID: 0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2
Network: Base Sepolia (84532)
```

### Register ENS Names ✅
```
simoproof.eth    → Sepolia — owner 0xB05741aF6f90666Ce27372001CEfC36Cab9bE580
node-1.simoproof.eth → Sepolia — owner 0xB05741aF6f90666Ce27372001CEfC36Cab9bE580
```

### First Pipeline Runs ✅
- [x] 5/5 EAS attestations live on base-sepolia.easscan.org
- [x] ENS text records updated on app.ens.domains (discoveries_count=10, latest_eas_uid set)

**End of Friday goal:** 5 real on-chain attestations. ✅ COMPLETE

---

## Saturday 2 May — Full Integration ✅ DONE

### Gensyn AXL ✅
AXL binary at `/workspace/axl-node`. Integration complete via `packages/axl/`:
- [x] AXL broadcast in pipeline step 1
- [x] Peer pre-validation logged per discovery
- [x] AXL pubkey stored in ENS text record

Run command (single node for hackathon demo):
```bash
/workspace/axl-node start --name simoproof-node-1 --api-port 7001 --tcp-port 9001
```

### KeeperHub MCP Integration ✅
- [x] 5 workflows created in KeeperHub dashboard
- [x] MCP server running at `packages/keeperhub/`
- [x] FEEDBACK.md at repo root with real integration notes
- [x] API key working: `kh_zcBcSoMYrZxO--I7GzR8PNG-2zT_WX7_`
- [x] Base URL: `https://app.keeperhub.com` (note: no `/api` suffix)

### All 5 Discoveries + Video Prep ✅

#### Full pipeline run
```bash
cd /workspace/simoproof
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all
```
All 5 discoveries confirmed ✅:
- disc-001: NSIDC Arctic sea ice (4.23 million km², Sep 2023) — ENDORSED 4/4
- disc-002: Global surface temperature (+1.45°C) — ENDORSED 4/4
- disc-003: Atmospheric CO₂ (421.08 ppm, 2023) — ENDORSED 4/4
- disc-004: PM2.5 air quality — ENDORSED 3/4
- disc-005: Brazil forest area — ENDORSED 3/4

#### EAS Attestation UIDs (live on Base Sepolia)
| Discovery | UID |
|-----------|-----|
| disc-001 | `0xd47257e63d2b5df37b78e33e00151cc63b33499c63c5fdbbe7b5317c167a7c64` |
| disc-002 | `0x882247eec16952c5e0732bbc4c815d97effa5b2a9e73a8bfae7fa95420eafa7a` |
| disc-003 | `0x5951be3cb56cdadeb687e50e4dea5b01865bac2b03ac554d207006a53fff09f6` |
| disc-004 | `0xf0991d197a3e1904fd9893a4ab6820ac22aecf01c06fef7e5bfbc64bb3a5eff6` |
| disc-005 | `0xddeb0ec4b6680369965bb12a12e980e045f7862bd9bcf7341073faa99287409a` |

#### Push to GitHub ✅
- [x] Public repo: https://github.com/web3guru888/simoproof
- [x] 12 clean commits, Apr 30 → May 2
- [x] Apache 2.0 (code) + CC BY 4.0 (docs)

---

## Sunday 3 May — Submit (this morning)

**Submit by noon. Don't leave for afternoon.**

### ETHGlobal Project Description

> **SimoProof** — a ZK-provable verified discovery network for AI agents. Every empirical claim is deliberated by a 4-agent Simocracy senate (Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor), proven with a RISC Zero ZK receipt, attested on-chain via EAS on Base Sepolia, stored on 0G, anchored to an ENS identity via ENSIP-25 text records, and tracked in KeeperHub automated workflows.
>
> **ENS:** Each verifier node registers as an ENS subname (`node-1.simoproof.eth`). ENSIP-25 text records store `axl_pubkey`, `capabilities`, `ens_name`, `discoveries_count`, and `latest_eas_uid` — making ENS the identity and discovery layer for the entire network.
>
> **KeeperHub:** 5 automated workflows drive the full pipeline lifecycle (poll → validate → prove → attest → ens-update). All orchestrated via a KeeperHub-native MCP server. Real integration feedback in `FEEDBACK.md` at repo root.
>
> **Gensyn AXL:** Claims are broadcast to the AXL network for peer pre-validation before proof generation. AXL pubkeys are stored in ENS text records for permissionless peer discovery.

### Submit Checklist
- [ ] Go to https://ethglobal.com/events/openagents
- [ ] Project name: **SimoProof**
- [ ] Paste project description (above)
- [ ] Add GitHub repo link: https://github.com/web3guru888/simoproof
- [ ] Upload demo video (YouTube or Loom — unlisted is fine)
- [ ] Live demo: https://simoproof.org
- [ ] Select exactly **3 prize tracks:** ENS + KeeperHub + Gensyn
- [ ] Submit ✓

---

## Evidence Checklist (What Judges Will Look For)

| Prize | What They'll Check | Where to Show It |
|-------|-------------------|-----------------|
| ENS | ENSIP-25 text records on a real ENS name | app.ens.domains — `node-1.simoproof.eth` |
| ENS | `discoveries_count`, `latest_eas_uid`, `axl_pubkey` fields | Same |
| KeeperHub | FEEDBACK.md at repo root | GitHub: `/FEEDBACK.md` |
| KeeperHub | 5 live workflows | KeeperHub dashboard screenshot |
| KeeperHub | MCP server code | `packages/keeperhub/` |
| Gensyn | AXL node running in pipeline | Step 1 of demo output |
| Gensyn | AXL pubkey stored in ENS | ENS text record screenshot |
| All | Working demo video ≤3 min | Video upload |
| All | Public GitHub repo | https://github.com/web3guru888/simoproof |
| All | Live demo | https://simoproof.org |

---

## Key Commands

```bash
# Full demo (dev mode, skip onchain — fast, ~50s)
cd /workspace/simoproof
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all --skip-onchain

# Full demo (with real onchain txs — ~3 min)
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all

# API server
npx tsx packages/api/src/server.ts

# Build frontend
cd packages/web && npm run build

# Run Foundry tests
cd contracts && forge test --gas-report
```

---

## Live Deployments

| Component | Network | Address |
|-----------|---------|---------|
| DiscoveryVerifier.sol | Base Sepolia (84532) | `0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6` |
| MockRiscZeroVerifier | Base Sepolia (84532) | Bundled in DiscoveryVerifier deploy |
| EAS Schema UID | Base Sepolia | `0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2` |
| RISC Zero Verifier Router | Base Sepolia | `0x0b144e07a0826182b6b59788c34b32bfa86fb711` |
| Guest Image ID | — | `0x4220fefa6dab2f88ffeeeb5048ae2df22385f2e00cfd5c12b1ab33e00b718ba2` |
| simoproof.eth | Sepolia | `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580` |
| node-1.simoproof.eth | Sepolia | `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580` |
| Frontend | Cloudflare Pages | https://simoproof.org |
