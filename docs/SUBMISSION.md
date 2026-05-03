# SimoProof — ETHGlobal Open Agents 2026 Submission

**Submission URL:** https://ethglobal.com/events/openagents/home  
**Deadline:** Sunday 3 May 2026 at 12:00pm EDT (16:00 UTC)  
**Repo:** https://github.com/web3guru888/simoproof  
**Live demo:** https://simoproof.org  

---

## Form Fields — Copy-Paste Ready

### Project Name
```
SimoProof
```

### Tagline (1 sentence, ~140 chars)
```
A ZK-provable, ENS-native protocol where a 4-agent AI senate verifies empirical claims and writes permanent on-chain attestations.
```

### Short Description (~280 chars)
```
SimoProof routes scientific discoveries through a 4-agent ASI:One senate, broadcasts pre-validation on Gensyn AXL, generates a RISC Zero ZK proof, attests permanently on EAS (Base Sepolia), pins to 0G Network, and anchors the result to an ENS identity via ENSIP-25 — all triggered by KeeperHub automation.
```

---

### What It Does (long description — 400–600 words)

```
SimoProof is a decentralised, ZK-provable verification protocol for empirical claims about the world.

The problem it solves: anyone can post a "discovery" on the internet — but nobody can easily prove that claim was independently reviewed, that the review process was honest, and that the result is permanent and tamper-proof. SimoProof solves this in a single automated pipeline.

How it works — 7-step pipeline:

1. AXL Ingestion (Gensyn): Every discovery is first broadcast on the Gensyn AXL P2P mesh for decentralised pre-validation before it reaches the AI senate.

2. Science Senate (ASI:One): A 4-agent senate — Bayesian Agent, Skeptic Agent, Causal Agent, Replication Agent — each independently evaluates the claim using ASI:One (api.asi1.ai). Each agent returns a structured verdict: endorse/reject + confidence score + reasoning. Quorum requires ≥ 2/4 endorsements.

3. RISC Zero ZK Proof: A Rust guest program runs inside the RISC Zero zkVM. It verifies: confidence ≥ 0.85, senate votes ≥ 2/4, and source SHA-256 integrity. The zkVM produces a cryptographic receipt proving the computation was honest.

4. 0G Storage: The proof JSON and senate transcript are pinned to 0G Network for decentralised, permanent storage.

5. EAS Attestation: DiscoveryVerifier.sol (Base Sepolia) validates the ZK receipt and calls the EAS GraphQL API to create a permanent on-chain attestation. 5 live attestations are already on-chain.

6. ENS Update (ENSIP-25): The agent node identity (node-1.simoproof.eth) is updated via ENSIP-25 text records: discoveries_count increments, latest_eas_uid is set. ENS becomes the living identity backbone for the agent network.

7. KeeperHub Automation: 5 KeeperHub scheduled workflows orchestrate every pipeline stage — discovery polling, senate dispatch, proof relay, EAS submission, ENS update — running autonomously without human intervention.

The result: a permanent, ZK-verified, ENS-anchored proof that a specific claim was reviewed by an AI senate and found credible — visible to anyone, forever, on-chain.

Live outputs: 5 EAS attestations on Base Sepolia, ENS text records with discoveries_count=10, and an interactive demo at simoproof.org where anyone can trigger the full pipeline in real-time.
```

---

### How We Built It

```
Monorepo (TypeScript/Rust) with 7 packages:

- packages/axl: AXL P2P mesh integration (Gensyn binary v0.2.1)
- packages/simocracy: 4-agent senate orchestrator (ASI:One LLM backend)
- packages/chain: RISC Zero prover + DiscoveryVerifier.sol (Foundry)
- packages/storage: 0G Network uploader
- packages/keeperhub: KeeperHub MCP server + 5 workflow definitions
- packages/api: Express REST API (runs in KeeperHub environment)
- packages/web: Single-file frontend (simoproof.org)

Smart contracts: Solidity + Foundry (8/8 tests passing)
ZK prover: Rust guest (risc0-zkvm v3.0, r0vm 3.0.5)
Identity: ENS ENSIP-25 text records on Sepolia
Attestations: EAS GraphQL + DiscoveryVerifier.sol on Base Sepolia
LLM: ASI:One (api.asi1.ai/v1, model: asi1)
Automation: KeeperHub (5 workflows, MCP server)
Hosting: Cloudflare Pages (simoproof.org)
```

---

### Challenges We Ran Into

```
1. RISC Zero dev-mode vs production: The production RISC Zero Verifier Router (Base Sepolia) rejects dev-mode receipts. We deployed a MockRiscZeroVerifier (0x844acEb...) for the hackathon demo and documented this clearly — production would use real proving hardware.

2. ENS nonce collision: Calling setText() multiple times in rapid succession caused nonce collisions. Fixed by adding waitForTransactionReceipt() between each setText call.

3. KeeperHub base URL: The KeeperHub SDK was sending requests to app.keeperhub.com/api/... (double path). Fixed by setting KEEPERHUB_BASE_URL=https://app.keeperhub.com (no /api suffix) and letting the SDK handle path construction.

4. AXL binary threading: The axl-node binary spawns multiple threads on startup. In memory-constrained environments, we run it with a timeout and treat broadcast completion as fire-and-forget.

5. 0G provider hang: The 0G ethers provider occasionally hangs on testnet. We added a 10s timeout and fall back to content-hash-as-CID when the upload times out.
```

---

### Accomplishments

```
- Full 7-step pipeline running end-to-end in ~3 minutes on testnet
- 5 live EAS attestations on Base Sepolia (all publicly verifiable)
- ENS identity (node-1.simoproof.eth) with live ENSIP-25 text records
- 8/8 Foundry unit tests passing
- Interactive demo at simoproof.org (trigger full pipeline in browser)
- Clean git history documenting the full build process (15 commits)
- KeeperHub MCP server enabling autonomous scheduled operation
```

---

### What We Learned

```
- ENSIP-25 is a powerful primitive for giving AI agents on-chain identity — the text record pattern works perfectly for storing agent state without custom contracts.
- EAS + ZK proofs are a natural pairing: ZK proves the computation was correct, EAS makes the result permanently queryable.
- KeeperHub's MCP server model is a great fit for AI agent automation — exposing pipeline steps as tools that can be scheduled or chained.
- ASI:One's API is a drop-in replacement for OpenAI — zero code changes needed beyond base URL + model name.
- AXL (Gensyn) brings real P2P mesh semantics to agent coordination — the broadcast pattern is more robust than centralised queuing for decentralised agent networks.
```

---

### What's Next

```
- Production ZK proving (replace MockRiscZeroVerifier with real RISC Zero circuit)
- Multi-node senate (deploy node-2.simoproof.eth, node-3.simoproof.eth)
- ENS subname registry for third-party discovery nodes
- EAS schema versioning for richer claim types (images, datasets, citations)
- KeeperHub alert workflows for anomaly detection in senate verdicts
- Mainnet deployment (Base mainnet + ENS mainnet)
```

---

## Prize Track Justifications (copy into each track's field)

### 🌐 ENS — Best AI Agent Integration

```
SimoProof gives AI agents a permanent on-chain identity via ENS + ENSIP-25.

The node-1.simoproof.eth ENS name stores the agent's live state as text records:
- discoveries_count: increments on every verified discovery (currently 10)
- latest_eas_uid: the most recent EAS attestation UID
- axl_pubkey: the Gensyn AXL public key for the node
- role, description: human-readable agent metadata

Every time the pipeline runs, packages/chain/src/ens.ts calls setText() via viem — ENS is not a label, it is the agent's identity layer. Any third party can resolve node-1.simoproof.eth and immediately know what this agent has verified, when, and where the proof lives.

ENS parent: simoproof.eth (Sepolia: 0xB05741aF...)
ENS node: node-1.simoproof.eth
Live on: https://app.ens.domains/node-1.simoproof.eth
```

### ⚡ Gensyn — Best AXL Application

```
SimoProof uses Gensyn's AXL P2P mesh as the first stage of every discovery pipeline.

Every incoming claim is serialised and broadcast via AXL before it reaches the AI senate. This provides:
1. Decentralised pre-validation — other nodes on the mesh can hear the broadcast
2. Gensyn compute mesh awareness — the claim enters the Gensyn network before any centralised processing
3. axl_pubkey stored in ENS — each SimoProof node's AXL identity is anchored to its ENS name

Implementation: packages/axl/src/index.ts wraps the axl-node binary (v0.2.1). The demo runs it as a subprocess, broadcasts the claim JSON, and proceeds to the senate once the broadcast is confirmed.

Binary: /workspace/axl-node (Gensyn AXL v0.2.1)
ENS text record: axl_pubkey → live on node-1.simoproof.eth
Code: packages/axl/
```

### 🤖 KeeperHub — Best Use of KeeperHub

```
SimoProof uses KeeperHub to fully automate the 7-step discovery pipeline with 5 scheduled workflows.

KeeperHub workflows:
1. discovery-poller: Polls for new pending discoveries every 5 minutes
2. senate-dispatcher: Triggers ASI:One senate evaluation for each new discovery
3. proof-relay: Submits proof to DiscoveryVerifier.sol after senate approval
4. eas-submitter: Creates EAS attestation after proof verification
5. ens-updater: Updates ENS text records (discoveries_count, latest_eas_uid) after attestation

MCP server: packages/keeperhub/src/mcp-server.ts — exposes each pipeline stage as an MCP tool so KeeperHub can call them directly.

API server: packages/api/src/server.ts — REST endpoints that KeeperHub webhooks call.

Feedback documented in FEEDBACK.md (repo root) — includes base URL bug, no local dev environment, MCP tool discovery.

KeeperHub API key: kh_zcBcSoMYrZxO... (configured)
Live workflows: 5 registered on https://app.keeperhub.com
Code: packages/keeperhub/
```

---

## Links for Submission Form

| Field | Value |
|-------|-------|
| **GitHub Repo** | https://github.com/web3guru888/simoproof |
| **Live Demo** | https://simoproof.org |
| **EAS Schema** | https://base-sepolia.easscan.org/schema/view/0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2 |
| **ENS Node** | https://app.ens.domains/node-1.simoproof.eth |
| **Attestation #1** | https://base-sepolia.easscan.org/attestation/view/0xd47257e63d2b5df37b78e33e00151cc63b33499c63c5fdbbe7b5317c167a7c64 |
| **Team** | Shaka (concept/vision) + Robin Dey / @web3guru888 (technical) |

---

## Video Script (2–4 min)

### Shot 1 — Intro (0:00–0:20)
> "SimoProof is a ZK-provable verification network for empirical claims. Every discovery goes through a 4-agent AI senate, gets a RISC Zero ZK proof, and is permanently attested on-chain via EAS — with ENS as the identity layer and KeeperHub automating everything."

**Show:** simoproof.org hero section

---

### Shot 2 — Stat strip + Architecture (0:20–0:45)
> "Here's the live site. You can see 10 verified discoveries, 4 senate agents, a 7-step pipeline."

**Show:** Scroll slowly down — stat strip → Architecture section → 7-step diagram

---

### Shot 3 — Run the Demo (0:45–1:45)
> "Let's run the pipeline live. I'll click Verify on Arctic Sea Ice — a real NSIDC dataset claim."

**Show:** 
- Click "▶ Run Interactive Demo" 
- Select disc-001 (Arctic sea ice preset)
- Click VERIFY
- Watch each step light up: AXL → Senate → Proof → 0G → EAS → ENS → KeeperHub
- Show the senate cards flip with endorsements
- Wait for "✅ Verified" result

---

### Shot 4 — Live EAS Attestation (1:45–2:15)
> "The attestation is real and on-chain. Let me click View EAS."

**Show:**
- Click "View EAS →" link
- New tab opens: base-sepolia.easscan.org showing the live attestation
- Point out: schema UID, attester address, decoded fields (claim, confidence, senate votes, imageId)

---

### Shot 5 — ENS Identity (2:15–2:45)
> "Every node has an ENS identity. Here's node-1.simoproof.eth — you can see discoveries_count is 10, and latest_eas_uid points to the most recent attestation."

**Show:**
- Open https://app.ens.domains/node-1.simoproof.eth
- Scroll to text records
- Point out: discoveries_count=10, latest_eas_uid, axl_pubkey, role

---

### Shot 6 — GitHub + Closing (2:45–3:00)
> "Full open-source monorepo — Solidity contracts, Rust ZK prover, TypeScript pipeline, KeeperHub MCP server. Apache 2.0. Built at ETHGlobal Open Agents 2026."

**Show:** GitHub repo root → briefly show packages/ folder structure

---

**Recording tips:**
- Use QuickTime (Mac) or OBS (Win/Linux) at 1080p
- No AI voiceover — record yourself narrating
- Keep it under 4 minutes
- Upload to YouTube (unlisted) or Loom, paste URL into ETHGlobal form
