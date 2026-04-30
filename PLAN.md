# SimoProof v3 — Submission Plan
**Hackathon:** ETHGlobal Open Agents
**Due:** Sunday 3 May 2026
**Time Remaining:** ~48 hours from May 1

---

## Prize Targets

| Track | Sponsor | Prize |
|-------|---------|-------|
| Best AI Agent Integration | ENS | $2,500 |
| Best Use + Feedback Bounty | KeeperHub | $4,500 + $250 |
| Best AXL Application | Gensyn | $5,000 |
| **Total best case** | | **~$12,250** |

---

## Tonight — Friday 1 May (Secrets & Deploy)

Get all accounts, keys, and the contract deployed. Nothing else is possible without this.

### Accounts & Keys
- [ ] Create a dedicated hackathon wallet — save private key securely
- [ ] Fund with Sepolia ETH — [sepoliafaucet.com](https://sepoliafaucet.com)
- [ ] Fund with Base Sepolia ETH — [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
- [ ] Sign up for Bonsai (Risc0 cloud prover) — [bonsai.risc0.com](https://bonsai.risc0.com) — get API key
- [ ] Sign up for KeeperHub — [keeperhub.com](https://keeperhub.com) — get API key
- [ ] Get Alchemy or Infura RPC URLs for Sepolia + Base Sepolia (free tier)
- [ ] Get an OpenAI API key for the real Simocracy senate
- [ ] Register an ENS name on Sepolia testnet — [app.ens.domains](https://app.ens.domains)

### Fill in .env
Open `/workspace/simoproof/.env` and populate all real values:

```
PRIVATE_KEY=0x...
BONSAI_API_KEY=...
ENS_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
ENS_NAME=yourname.eth
OPENAI_API_KEY=sk-...
KEEPERHUB_API_KEY=...
```

### Deploy Contract to Base Sepolia
```bash
cd /workspace/simoproof/contracts
forge script script/Deploy.s.sol \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```
Save the deployed address → add to `.env` as `DISCOVERY_VERIFIER_ADDRESS`

### Register EAS Schema
- Go to [base-sepolia.easscan.org](https://base-sepolia.easscan.org)
- Create schema: `bytes32 claim_hash, bytes32 source_commitment, bytes32 consensus_hash, bytes zk_proof, string ipfs_cid, address atlas_node, string ens_name`
- Save the schema UID → add to `.env` as `SCHEMA_UID`

### First Real Pipeline Run
```bash
npx tsx scripts/demo.ts --discovery disc-001
```
- [ ] Confirm EAS attestation appears on [base-sepolia.easscan.org](https://base-sepolia.easscan.org)
- [ ] Confirm ENS text records updated on [app.ens.domains](https://app.ens.domains)

**End of Friday goal:** 1 real on-chain attestation with a real ZK proof. ✓

---

## Saturday 2 May — Full Integration

### Morning: Gensyn AXL (2 hours)

Start 3 AXL node processes — each must be a **separate process** (Gensyn prize requirement):

```bash
# Terminal 1 — bootstrap node
/workspace/axl-node start --name simoproof-node-1 --api-port 7001 --tcp-port 9001

# Terminal 2 — peers to node-1
/workspace/axl-node start --name simoproof-node-2 --api-port 7002 --tcp-port 9002 \
  --peer tls://127.0.0.1:9001

# Terminal 3 — peers to node-1
/workspace/axl-node start --name simoproof-node-3 --api-port 7003 --tcp-port 9003 \
  --peer tls://127.0.0.1:9001
```

Update `.env`:
```
AXL_NODE_1_URL=http://127.0.0.1:7001
AXL_NODE_2_URL=http://127.0.0.1:7002
AXL_NODE_3_URL=http://127.0.0.1:7003
```

- [ ] Confirm topology: `curl http://127.0.0.1:7001/topology` — should show 3 peers
- [ ] Run a discovery — confirm `[axl] pre-validation` appears in logs (not "skipped")
- [ ] Screenshot the topology output — needed for submission

### Midday: KeeperHub MCP Integration (2 hours)

KeeperHub calls your MCP server via webhook — it needs a **publicly accessible URL**.

```bash
# Step 1: Start ngrok tunnel
ngrok http 3000

# Step 2: Start the API server
npx tsx packages/api/src/server.ts

# Step 3: Create the 5 KeeperHub workflows
MCP_SERVER_URL=https://xxxx.ngrok.io \
npx tsx packages/keeperhub/src/jobs.ts
```

- [ ] Verify all 5 workflows are live in the KeeperHub dashboard
- [ ] Manually trigger the poll webhook and confirm MCP server responds
- [ ] Screenshot the KeeperHub dashboard with workflows active — needed for submission
- [ ] Confirm `FEEDBACK.md` is at repo root ✅ (already present)

### Afternoon: All 5 Discoveries + Video (3 hours)

#### Full pipeline run
```bash
npx tsx scripts/demo.ts --all
```
Expect ~3–5 minutes per discovery (Bonsai Groth16 proof generation).

- [ ] All 5 EAS attestations visible on easscan.org
- [ ] ENS `discoveries_count` = 5 and `latest_eas_uid` updated on app.ens.domains
- [ ] AXL broadcast logged for each discovery (3-node pre-validation)

#### Record demo video (≤3 minutes — hard limit)

| Timestamp | What to show |
|-----------|-------------|
| 0:00–0:30 | Problem statement: "AI agents make claims — how do we verify them on-chain?" Show architecture diagram |
| 0:30–1:30 | Live terminal run of `demo.ts --discovery disc-001` — narrate each pipeline step |
| 1:30–2:00 | Open easscan.org — show the EAS attestation with ZK proof attached |
| 2:00–2:20 | Open app.ens.domains — show `discoveries_count` and `latest_eas_uid` text records |
| 2:20–2:40 | Show KeeperHub dashboard (5 active workflows) + AXL topology (3 nodes) |
| 2:40–3:00 | Novel contribution: "AXL pubkeys stored in ENSIP-25 ENS text records — ENS becomes the discovery layer for encrypted P2P agent coordination" |

#### Push to GitHub
- [ ] Create a public GitHub repo
- [ ] `git init && git add . && git commit -m "SimoProof v3 — ETHGlobal Open Agents"` 
- [ ] `git remote add origin https://github.com/YOUR_USERNAME/simoproof && git push`

---

## Sunday 3 May — Submit (morning)

**Do not leave this until the afternoon. Submit by noon.**

### ETHGlobal Project Description

> **SimoProof v3** — a ZK-provable verified discovery network for AI agents. Every empirical claim is deliberated by a 4-agent Simocracy senate (Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor), proven with a Risc0 ZK receipt, attested on-chain via EAS on Base, stored on 0G, and anchored to an ENS identity via ENSIP-25 text records. Agent nodes discover each other over Gensyn AXL using pubkeys stored in ENS. The full lifecycle is automated via KeeperHub's MCP-native workflow engine.
>
> **ENS:** Each verifier node registers as an ENS subname. ENSIP-25 text records store `axl_pubkey`, `capabilities`, `discoveries_count`, and `latest_eas_uid` — making ENS the identity and discovery layer for the entire network. Novel primitive: AXL pubkeys in ENS text records enables permissionless encrypted P2P agent discovery without a centralised registry.
>
> **KeeperHub:** 5 automated workflows handle the full pipeline lifecycle (poll → validate → prove → attest → ens-update). All triggered via a KeeperHub-native MCP server mounted at `/mcp`. Detailed integration feedback in `FEEDBACK.md` at repo root.
>
> **Gensyn AXL:** Claims are broadcast to a 3-node AXL network for peer pre-validation before proof generation. Each node is a separate process. AXL pubkeys are stored in ENS text records for permissionless peer discovery.

### Submit Checklist
- [ ] Go to [ethglobal.com/events/openagents](https://ethglobal.com/events/openagents)
- [ ] Project name: **SimoProof v3**
- [ ] Paste project description (above)
- [ ] Add GitHub repo link
- [ ] Upload demo video (YouTube or Loom — unlisted is fine)
- [ ] Select exactly **3 prize tracks:** ENS + KeeperHub + Gensyn
- [ ] Submit ✓

### Post-Submit Buffer
Sunday afternoon is buffer. If anything is wrong with the submission portal or you need to rerecord the video, you have time.

---

## Evidence Checklist (What Judges Will Look For)

| Prize | What They'll Check | Where to Show It |
|-------|-------------------|-----------------|
| ENS | ENSIP-25 text records on a real ENS name | app.ens.domains screenshot + live link |
| ENS | Agent identity (axl_pubkey, capabilities fields) | Same |
| KeeperHub | FEEDBACK.md at repo root | GitHub link directly to file |
| KeeperHub | Live workflows in dashboard | Screenshot in submission |
| KeeperHub | MCP server integration | Code in `packages/keeperhub/` |
| Gensyn | 3 **separate** AXL node processes | Video showing 3 terminals + topology |
| Gensyn | AXL pubkey stored in ENS | ENS text record screenshot |
| All | Working demo video ≤3 min | Video upload |
| All | Public GitHub repo | GitHub link |

---

## Key File Locations

| What | Where |
|------|-------|
| Environment config | `/workspace/simoproof/.env` |
| Pipeline runner | `npx tsx scripts/demo.ts --all` |
| API server | `npx tsx packages/api/src/server.ts` |
| KeeperHub workflow creator | `npx tsx packages/keeperhub/src/jobs.ts` |
| Contract deploy script | `contracts/script/Deploy.s.sol` |
| KeeperHub prize requirement | `FEEDBACK.md` ✅ |
| Docker Compose (AXL nodes) | `docker-compose.yml` |

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Bonsai quota / slow first proof | Medium | Start Friday evening — cache builds up overnight |
| KeeperHub needs public URL | **High — must do** | ngrok immediately on Saturday morning |
| AXL binary flags differ from expected | Medium | Test with `--help` before full run |
| ENS gas higher than faucet gives | Low | Fund with 0.5+ Sepolia ETH |
| Submission portal slow on deadline | Low | Submit by Sunday noon, not Sunday night |
| Demo video goes over 3 minutes | Low | Script and rehearse once before recording |
