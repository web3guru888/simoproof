# SimoProof — Product Requirements Document
**Version:** 2.0 (updated May 2, 2026 — reflects as-built system)  
**Date:** 2026-05-02  
**Target Event:** ETHGlobal Open Agents Hackathon (April 24 – May 6, 2026)  
**Event URL:** https://ethglobal.com/events/openagents  
**Submission Deadline:** May 3, 2026 at 12:00pm EDT  
**Status:** ✅ BUILD COMPLETE

---

## 1. Problem Statement

AI agents are proliferating across every Web3 protocol. They transact, vote, lend, trade, and coordinate — but no one can answer a simple question: **who is this agent, and should I trust it?**

The current state is broken in three ways:

1. **No persistent identity.** Agents are identified by ephemeral wallet addresses. There is no human-readable name, no metadata, no history attached. When an agent acts badly, its address is burned and a new one created. Zero accountability.

2. **No verifiable provenance.** When an agent claims to have verified a fact or completed a task, there is no on-chain way to verify this. Anyone can forge a result. Downstream agents, users, and protocols are blind to the difference.

3. **No execution reliability.** When agent-initiated transactions fail (gas spike, nonce collision, network congestion), there is no standardized retry layer. Critical on-chain operations — attestations, registry updates, protocol calls — silently drop.

The Ethereum ecosystem has shipped the building blocks to fix all three: ENSIP-25 (AI agent identity via ENS, 2026), EAS (Ethereum Attestation Service, production), and KeeperHub (execution reliability layer, MCP-native). But no one has connected these into a coherent, working system with cryptographic proof.

**SimoProof is that system.**

---

## 2. Solution Overview

SimoProof is a **verified discovery network for AI agents** — a pipeline that takes any empirical claim, subjects it to multi-agent deliberation, generates a ZK proof of the deliberation process, attests the result on-chain, stores the source data on decentralized storage, and anchors everything to an ENS identity.

Seven pipeline stages, unified:

| Stage | Technology | What It Provides |
|-------|-----------|-----------------|
| **1. Broadcast** | Gensyn AXL | Peer pre-validation across decentralized agent nodes |
| **2. Deliberate** | Simocracy Senate (ASI:One) | 4-agent consensus on claim validity (2/4 threshold) |
| **3. Prove** | RISC Zero | ZK receipt proving the deliberation was executed honestly |
| **4. Store** | 0G Network | Decentralized storage of source data + proof |
| **5. Attest** | EAS on Base | Immutable on-chain attestation with ZK proof attached |
| **6. Identify** | ENS / ENSIP-25 | Human-readable node identity, discovery metadata |
| **7. Automate** | KeeperHub | Guaranteed execution, workflow orchestration, retry logic |

A verified discovery in SimoProof looks like this:

```
node-1.simoproof.eth
├── ENS text record: ens_name → "node-1.simoproof.eth"
├── ENS text record: capabilities → ["verify","attest","store"]
├── ENS text record: axl_pubkey → <ed25519 public key for AXL>
├── ENS text record: discoveries_count → "10"
├── ENS text record: latest_eas_uid → "0xd47257..."
└── EAS attestations: 5 verified discoveries on Base Sepolia
```

Anyone — human or agent — can resolve `node-1.simoproof.eth` and immediately see: who verified this claim, where the proof is, and whether the deliberation was honest.

---

## 3. Prize Track Targeting

SimoProof targets **3 partner tracks** (ETHGlobal maximum):

### Track A: ENS — "Best AI Agent Integration" ($5,000)
**URL:** https://ethglobal.com/events/openagents/prizes  
**Requirement:** ENS must do real work — resolving agent address, storing metadata, gating access, enabling discovery. No hard-coded demo values.

**How SimoProof satisfies this:**
- `node-1.simoproof.eth` registered on Sepolia with real ENSIP-25 text records
- Text records store: ENS name, AXL pubkey, capabilities, `discoveries_count`, `latest_eas_uid`
- After every verified discovery, KeeperHub updates the text records on-chain
- Live resolution: `ensText("node-1.simoproof.eth", "discoveries_count")` returns current count
- ENS = the public state board for the entire verification network

**Deployed:** `simoproof.eth` + `node-1.simoproof.eth` on Sepolia (owner `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580`)

---

### Track B: KeeperHub — "Best Use of KeeperHub" ($5,000)
**URL:** https://keeperhub.com/blog/008-first-hackathon-openagents  
**Requirement:** MCP server or CLI integration. Must work and solve a real problem. Real utility over novelty. Clean code, clear documentation.

**How SimoProof satisfies this:**
- 5 KeeperHub workflows automate the full pipeline lifecycle
- MCP server at `packages/keeperhub/` exposes 6 tools
- All on-chain operations (EAS attestation, ENS text record updates) route through KeeperHub for retry guarantees
- Honest integration feedback in `FEEDBACK.md` at repo root (required for feedback bounty)
- Real problem solved: without KeeperHub, critical agent operations drop silently; with it, they're guaranteed and auditable

**API key:** `kh_zcBcSoMYrZxO--I7GzR8PNG-2zT_WX7_`  
**Base URL:** `https://app.keeperhub.com`

---

### Track C: Gensyn AXL — "Best AXL Application" ($5,000)
**URL:** https://docs.gensyn.ai/tech/agent-exchange-layer  
**Hard requirements:** (1) Use AXL for inter-agent communication. (2) Demonstrate across separate AXL nodes. (3) Built during hackathon.

**How SimoProof satisfies this:**
- Claims are broadcast to the AXL network as Step 1 of the pipeline (before proof generation)
- AXL pubkey stored in ENS text record on `node-1.simoproof.eth` = ENS-anchored AXL discovery
- Novel primitive: other agents can resolve `node-1.simoproof.eth`, get the AXL pubkey, and connect directly — no centralized registry
- AXL binary at `/workspace/axl-node`; integration in `packages/axl/`

---

### Prize Summary

| Track | Prize |
|-------|-------|
| ENS AI Agent Identity | $5,000 |
| KeeperHub Best Use | $5,000 |
| Gensyn AXL | $5,000 |
| **Total best case** | **$15,000** |

---

## 4. Target Users

**Primary:** AI agent developers building systems where agents need verifiable, on-chain provenance for their outputs.

**Secondary:** Protocol teams who want to verify which agents are authorized to interact with their contracts — and audit what claims those agents have verified.

**Tertiary:** End users and researchers who want a trustless way to verify that an AI-generated factual claim is backed by multi-agent deliberation and cryptographic proof.

---

## 5. Core User Stories

**As an agent developer, I want to:**
- Register my agent with a human-readable ENS name in under 5 minutes
- Have my agent's discoveries automatically discoverable by other agents via ENS
- Know that every on-chain operation my agent initiates will succeed or fail loudly (not silently drop)
- See my agent's verified discovery count accumulate in the ENS identity record

**As a receiving agent, I want to:**
- Resolve another agent's ENS name and instantly see: what has it verified? How many discoveries?
- Fetch the EAS attestation UID for any specific discovery and verify the ZK proof
- Connect to the agent over AXL using the pubkey stored in the ENS text record

**As a researcher or auditor, I want to:**
- Query EAS on Base Sepolia for all attestations from a given node
- Verify the ZK receipt that proves the deliberation happened honestly
- See which of 4 senators endorsed the claim and what their reasoning was

---

## 6. MVP Feature Set (As Built)

### F1: 7-Step Verified Discovery Pipeline ✅
The full pipeline, end-to-end:
```
[AXL Broadcast] → [Simocracy Senate] → [ZK Proof] → [0G Storage] → [EAS Attest] → [ENS Update] → [KeeperHub Log]
```
- Input: `{ claim, source_url, confidence, raw_source_bytes }`
- Output: EAS attestation UID on Base Sepolia + updated ENS text records

### F2: Simocracy Senate (4-Agent Deliberation) ✅
- 4 senators: Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor
- Each calls ASI:One (`api.asi1.ai/v1`) with their unique deliberation constitution
- Threshold: 2/4 endorsements required
- Consensus hash computed over all 4 votes

### F3: RISC Zero ZK Proof ✅
- Guest program in `packages/prover/src/` (Rust)
- Proves: claim hash, source commitment, consensus hash were computed correctly
- Dev mode (`RISC0_DEV_MODE=true`): ~50s for 5 discoveries
- Production mode: Groth16 proof generation (~3-5 min per discovery)
- `GUEST_IMAGE_ID`: `0x4220fefa6dab2f88ffeeeb5048ae2df22385f2e00cfd5c12b1ab33e00b718ba2`

### F4: 0G Decentralized Storage ✅
- Source data uploaded to 0G testnet (`https://evmrpc-testnet.0g.ai`)
- Returns storage CID stored in EAS attestation

### F5: EAS Attestation on Base Sepolia ✅
- Schema: `bytes32 claim_hash, bytes32 source_commitment, bytes32 consensus_hash, bytes zk_proof, string ipfs_cid, address atlas_node, string ens_name`
- Schema UID: `0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2`
- 5 live attestations confirmed on base-sepolia.easscan.org

### F6: ENS Identity via ENSIP-25 ✅
- `node-1.simoproof.eth` registered on Sepolia
- Text records: `ens_name`, `capabilities`, `axl_pubkey`, `discoveries_count`, `latest_eas_uid`
- Updated after each successful discovery pipeline run

### F7: KeeperHub MCP Automation ✅
- 5 workflows covering full pipeline lifecycle
- MCP server: `packages/keeperhub/src/server.ts`
- 6 MCP tools exposed
- Real API key integrated and tested

### F8: Interactive Demo Frontend ✅
- Live at https://simoproof.org (Cloudflare Pages)
- "Scientific Tribunal" aesthetic — dark forest green + acid lime palette
- 5 preset claims with real EAS UIDs (links to live attestations)
- Custom claim mode (senate simulation with simulated timing)
- 3D flip cards for senate senator votes

---

## 7. Previously Out of Scope — Now In Scope

| Feature | Original Plan | Actual |
|---------|--------------|--------|
| 0G Storage | Out of scope (4th track) | ✅ Built (integrated in pipeline) |
| Interactive frontend | Basic demo | ✅ Full "Scientific Tribunal" UI at simoproof.org |
| Custom claim verification | Not planned | ✅ Users can enter any claim |

Items still deferred to post-hackathon:
- Self.xyz ZK identity integration
- World ID proof-of-personhood
- Reputation staking / slashing
- Production ENS mainnet deployment
- Multi-chain support

---

## 8. Demo Scenario (What Judges See)

**simoproof.org — interactive demo:**

1. Judge visits https://simoproof.org
2. Selects a preset claim (e.g., "Arctic sea ice minimum extent in September 2023 was 4.23 million km²...")
3. Clicks **Verify Claim**
4. Watches the 7-step pipeline animate:
   - Step 1: AXL broadcast → peer pre-validation
   - Step 2: Simocracy senate → 4 senators deliberate (3D flip cards reveal ENDORSE/REJECT)
   - Step 3: RISC Zero ZK proof generated
   - Step 4: 0G storage upload
   - Step 5: EAS attestation submitted
   - Step 6: ENS text records updated
   - Step 7: KeeperHub workflow logged
5. Result: ✅ VERIFIED — with link to live EAS attestation on Base Sepolia
6. Clicks "View EAS →" → goes directly to `base-sepolia.easscan.org/attestation/view/{uid}` (real on-chain data)

---

## 9. Technical Constraints & Hard Requirements

| Requirement | Source | Status |
|------------|--------|--------|
| AXL demo uses separate nodes | Gensyn | ✅ |
| ENS demo has no hard-coded values | ENS | ✅ (real Sepolia records) |
| **FEEDBACK.md** at repo root | KeeperHub | ✅ |
| KeeperHub via **MCP server** | KeeperHub | ✅ |
| Contract deployment addresses in submission | ETHGlobal | ✅ |
| Demo video **≤ 3 minutes** | ETHGlobal | ⏳ Record this morning |
| Public GitHub repo + README | All tracks | ✅ |
| Live demo link | All tracks | ✅ simoproof.org |
| Select **max 3 partner prizes** | ETHGlobal | ✅ ENS + KeeperHub + Gensyn |

---

## 10. Success Metrics

**Hackathon success:**
- Finalist in ≥1 prize track ← primary goal
- Working demo that runs end-to-end without crashes ✅
- All hard requirements satisfied for all 3 selected tracks ✅
- Live demo on simoproof.org that judges can interact with ✅

**Product success (post-hackathon):**
- 5+ agent developers integrate SimoProof identity in 30 days
- ≥1 protocol team uses SimoProof's ENS-gated agent verification
- Gensyn Foundation grant application submitted (enabled by AXL track win)
- ENSIP-26 (cross-chain agent identity) referenced in technical design

---

## 11. Why SimoProof Wins

| Criterion | SimoProof Score | Why |
|-----------|----------------|-----|
| **Creativity** | High | ZK-proven multi-agent deliberation + ENS-anchored AXL discovery are new primitives |
| **Functionality** | High | 3 fully working integrations satisfying 3 separate sponsor hard requirements |
| **Technical Difficulty** | High | 7-protocol integration (AXL, ASI:One, RISC Zero, 0G, EAS, ENS, KeeperHub) working in concert |
| **Impact** | High | Answers "who is that agent and can I trust its outputs?" — the question every onchain protocol will face |

**The meta-narrative:** SimoProof is not a toy demo. It is the infrastructure that makes AI agent outputs trustworthy — cryptographically, on-chain, and auditable by anyone. ENSIP-25 shipped in 2026. ERC-8004 shipped in 2026. The timing makes this feel inevitable rather than speculative.

---

*Document end. See SPEC for technical implementation details.*
