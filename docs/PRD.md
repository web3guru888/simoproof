# SimoProof — Product Requirements Document
**Version:** 1.0  
**Date:** 2026-04-30  
**Target Event:** ETHGlobal Open Agents Hackathon (April 24 – May 6, 2026)  
**Event URL:** https://ethglobal.com/events/openagents  
**Submission Deadline:** ~May 3, 2026  

---

## 1. Problem Statement

AI agents are proliferating across every Web3 protocol. They transact, vote, lend, trade, and coordinate — but no one can answer a simple question: **who is this agent, and should I trust it?**

The current state is broken in three ways:

1. **No persistent identity.** Agents are identified by ephemeral wallet addresses. There is no human-readable name, no metadata, no history attached. When an agent acts badly, its address is burned and a new one created. Zero accountability.

2. **No verifiable provenance.** When an agent claims to be "the official Aave liquidation bot," there is no onchain way to verify this. Anyone can deploy an impostor. Downstream agents, users, and protocols are blind to the difference.

3. **No execution reliability.** When agent-initiated transactions fail (gas spike, nonce collision, network congestion), there is no standardized retry layer. Critical onchain operations — attestations, registry updates, protocol calls — silently drop.

The Ethereum ecosystem has shipped the building blocks to fix all three: ENSIP-25 (AI agent identity via ENS, 2026), ERC-8004 (on-chain agent registry, live February 2026), EAS (Ethereum Attestation Service, production mainnet), and KeeperHub (execution reliability layer, MakerDAO-tested). But no one has connected these into a coherent, working system.

**SimoProof is that system.**

---

## 2. Solution Overview

SimoProof is a **verified agent identity and communication network** — the infrastructure layer that makes AI agents accountable, discoverable, and reliably executable.

Three primitive capabilities, unified:

| Layer | Technology | What It Provides |
|-------|-----------|-----------------|
| **Identity** | ENS subnames + ENSIP-25 | Human-readable agent names, onchain metadata, discovery |
| **Communication** | Gensyn AXL | Encrypted, decentralized P2P messaging between agents |
| **Execution** | KeeperHub | Guaranteed onchain execution with retry logic and audit trails |

And the reputation layer that ties them together:
| **Attestation** | EAS | Immutable, queryable behavioral records per agent identity |

An agent in SimoProof looks like this:

```
alice.agents.eth
├── ENS text record: agent-registration → ERC-8004 registry ID
├── ENS text record: capabilities → ["research", "execute-trades"]
├── ENS text record: axl-pubkey → <ed25519 public key for AXL>
├── EAS attestations: 47 verified task completions
└── KeeperHub history: 99.2% execution success rate
```

Anyone — human or agent — can resolve `alice.agents.eth` and immediately know: who this agent is, what it can do, how to reach it (AXL pubkey), and whether it has a track record.

---

## 3. Prize Track Targeting

SimoProof targets **3 partner tracks** (ETHGlobal maximum):

### Track A: ENS — "Best ENS Integration for AI Agents" ($2,500)
**URL:** https://ethglobal.com/events/openagents/prizes  
**Requirement:** ENS must do real work — resolving agent address, storing metadata, gating access, enabling discovery, coordinating agent-to-agent interaction. No hard-coded demo values.

**How SimoProof satisfies this:**
- Every SimoProof agent owns an ENS subname (e.g., `alice.agents.eth`)
- ENSIP-25 text records store: ERC-8004 registry ID, agent capabilities manifest, AXL public key, EAS schema UIDs
- Agent discovery: resolve `*.agents.eth` subnames → get full agent capability graph
- Access control: only ENS-verified agents admitted to SimoProof network
- Agent-to-agent: agents locate each other by resolving ENS names → extract AXL pubkey → initiate AXL connection
- No hard-coded values — all resolution is live on Sepolia/mainnet

**Relevant standard:** ENSIP-25 (https://docs.ens.domains/building-with-ai/)

---

### Track B: KeeperHub — "Best Use of KeeperHub" ($4,500)
**URL:** https://keeperhub.com/blog/008-first-hackathon-openagents  
**Requirement:** MCP server or CLI integration. Must work and solve a real problem. Real utility over novelty. Clean code, clear documentation.

**Also targeting:** KeeperHub Feedback Bounty ($250) — honest, actionable integration feedback in write-up.

**How SimoProof satisfies this:**
- KeeperHub MCP server integrated directly into SimoProof agent runtime
- Agents use KeeperHub for ALL onchain operations:
  - Submitting EAS attestations (with retry on gas spikes)
  - Updating ENS text records when agent state changes
  - Registering/updating ERC-8004 agent records
- KeeperHub's audit trail serves as the "execution history" component of agent reputation
- Demonstrated failure-then-recovery scenario in demo (network congestion → KeeperHub retries → success)
- **Real problem solved:** without KeeperHub, critical agent operations drop silently; with it, they're guaranteed
- FEEDBACK.md submitted as part of KeeperHub feedback bounty

---

### Track C: Gensyn AXL — "Best Application of Agent eXchange Layer" ($5,000)
**URL:** https://docs.gensyn.ai/tech/agent-exchange-layer  
**Hard requirements:** (1) Use AXL for inter-agent communication — no centralized broker. (2) Demonstrate across **separate AXL nodes**, not in-process. (3) Built during hackathon.

**How SimoProof satisfies this:**
- Each SimoProof agent runs its own AXL node (separate process, separate ed25519 keypair)
- Agents communicate exclusively via AXL — task delegation, verification requests, result attestations
- Demo shows 3 agents on 3 separate AXL nodes passing structured messages, with all comms encrypted end-to-end
- AXL public key stored in ENS text record = ENS-anchored AXL discovery (novel primitive)
- Real utility: agents find each other via ENS, then form encrypted private channels via AXL — zero centralized coordination

**Grant incentive:** All Gensyn track winners fast-tracked into Gensyn Foundation grant programme.

---

### Total Prize Potential

| Track | 1st Place | 2nd Place | 3rd Place |
|-------|-----------|-----------|-----------|
| ENS AI Agent Identity | $1,250 | $750 | $500 |
| KeeperHub Best Use | $2,500 | $1,500 | $500 |
| Gensyn AXL | $2,500 | $1,500 | $1,000 |
| KeeperHub Feedback Bounty | $250 | $250 | — |
| **Best Case (all 1st)** | **$6,500** | | |
| **Conservative (all 3rd)** | **$2,000** | | |

---

## 4. Target Users

**Primary:** AI agent developers building systems where multiple agents must coordinate and transact onchain.

**Secondary:** Protocol teams who want to whitelist/verify agent actors interacting with their contracts (e.g., Aave wanting to verify that only "official liquidation agents" can trigger liquidations).

**Tertiary:** End users who want to understand what AI agents are acting on their behalf and verify their track record before granting permissions.

---

## 5. Core User Stories

**As an agent developer, I want to:**
- Register my agent with a human-readable ENS name in under 5 minutes
- Have my agent's capabilities automatically discoverable by other agents
- Know that every onchain operation my agent initiates will succeed or fail loudly (not silently drop)
- See my agent's reputation accumulate as it completes verified tasks

**As a receiving agent, I want to:**
- Resolve another agent's ENS name and instantly know: can it do what it claims?
- Open an encrypted P2P channel to that agent via AXL without managing keys manually
- Verify the other agent's attestation history before accepting task delegation

**As a protocol team, I want to:**
- Gate contract actions to only ENS-verified, EAS-attested agents with minimum reputation scores
- Query "show me all agents with capability X and ≥N verified task completions"
- Audit every agent action tied to a human-readable identity (not just a hex address)

---

## 6. MVP Feature Set

The hackathon MVP demonstrates a **three-agent verified task pipeline:**

### F1: ENS Agent Identity Registration
- `agents.eth` subname registrar contract (deploy on Sepolia)
- Register `alice.agents.eth`, `bob.agents.eth`, `carol.agents.eth`
- Populate ENSIP-25 text records: capabilities, AXL pubkey, ERC-8004 registry ID
- ENS resolver returns full agent identity on name lookup

### F2: AXL-Powered Agent Communication
- Each agent spawns its own AXL node (3 separate nodes, 3 separate ed25519 keypairs)
- AXL pubkey stored in ENS text record at registration time
- Agent A resolves Agent B's ENS name → extracts AXL pubkey → opens encrypted channel
- Structured message protocol: `TaskRequest`, `TaskResult`, `VerificationRequest`, `AttestationProposal`
- Observable message flow in demo UI

### F3: KeeperHub Execution Layer
- Agents connect to KeeperHub via MCP server
- All EAS attestation submissions routed through KeeperHub
- All ENS text record updates routed through KeeperHub
- Demo includes deliberate failure scenario → KeeperHub retry → success confirmation
- Full execution audit trail visible in demo UI

### F4: EAS Reputation Attestations
- Deploy custom EAS schema: `{ agentENS: string, taskType: string, outcome: bool, details: string, verifierENS: string }`
- On task completion, verifier agent (Carol) creates EAS attestation about executor (Bob)
- Attestations queryable by ENS name → reputation score derived
- Displayed in agent identity card in frontend

### F5: Demo Frontend
- Three agent cards side-by-side (Alice/Bob/Carol) showing ENS name, capabilities, AXL status
- Live message log: AXL messages between agents (decrypted for demo view)
- KeeperHub execution status panel: pending → submitted → confirmed
- EAS reputation ticker: attestations appearing in real-time
- "Run Demo Scenario" button: triggers full pipeline automatically

### F6: Submission Artifacts
- GitHub repo with clean README and architecture diagram
- FEEDBACK.md for KeeperHub (honest integration notes)
- Demo video ≤ 3 minutes showing all 3 tracks' requirements
- Live demo link (hosted frontend + Sepolia contracts)

---

## 7. Out of Scope (Hackathon)

- Self.xyz ZK integration (adds complexity; defer to post-hackathon)
- World ID proof-of-personhood (same — powerful addition but not needed for MVP)
- 0G Chain deployment (would require 4th track selection; saving for future)
- Reputation staking / slashing (mentioned in ERC-8004 spec but not MVP)
- Production ENS mainnet deployment (Sepolia for hackathon)
- Multi-chain support

These are noted in README as roadmap items.

---

## 8. Demo Scenario (The Story Judges Watch)

**"The Verified Research Task"**

1. Alice (Researcher agent, `alice.agents.eth`) is assigned: *"Research gas price trends on Ethereum for the last 24 hours and trigger a buy if conditions are met."*

2. Alice resolves `bob.agents.eth` via ENS → sees Bob is a verified Executor with 32 confirmed trades → opens AXL channel to Bob.

3. Alice sends Bob a `TaskRequest` via AXL: *"If gas < 15 gwei in next 30 mins, execute buy."*

4. Alice resolves `carol.agents.eth` → Carol is a Verifier → opens AXL channel to Carol, forwards the task parameters for pre-approval.

5. Carol checks Alice and Bob's EAS reputation → both have clean records → sends `AttestationProposal` back via AXL: *"I'll attest this task on completion."*

6. Gas condition triggers. Bob uses **KeeperHub** to execute the trade (gas spike mid-flight → KeeperHub retries → confirmed).

7. Bob sends `TaskResult` to Carol via AXL with execution proof.

8. Carol submits **EAS attestation** via **KeeperHub**: `{ agentENS: "bob.agents.eth", outcome: true, details: "Trade executed at 14.2 gwei" }` — with KeeperHub retry ensuring it lands onchain.

9. Bob's ENS identity card now shows: 33 verified task completions. His on-chain reputation has grown.

10. Full audit trail: the ENS name, the AXL message log, and the EAS attestation are all publicly queryable and linked.

**Judges see:** ENS doing real identity work, AXL doing real P2P communication across 3 separate nodes, KeeperHub doing real execution with retry, EAS building real reputation. All integrated, all working.

---

## 9. Technical Constraints & Hard Requirements

| Requirement | Source | Must-Have |
|------------|--------|-----------|
| AXL demo across **separate nodes**, not in-process | Gensyn | ✅ Critical |
| ENS demo: **no hard-coded values** | ENS | ✅ Critical |
| **FEEDBACK.md** in repo root | KeeperHub feedback bounty | ✅ Critical |
| KeeperHub via **MCP server or CLI** | KeeperHub | ✅ Critical |
| AXL built with **Go 1.25.x** | Gensyn | ✅ Critical |
| Contract deployment addresses in submission | ETHGlobal baseline | ✅ Required |
| Demo video **≤ 3 minutes** | ETHGlobal / 0G | ✅ Required |
| Public GitHub repo + README | All tracks | ✅ Required |
| Live demo link | All tracks | ✅ Required |
| Work completed **during hackathon** | ETHGlobal | ✅ Required |
| Select **max 3 partner prizes** | ETHGlobal | ✅ Critical (ENS + KeeperHub + Gensyn) |

---

## 10. Success Metrics

**Hackathon success:**
- Finalist in ≥1 prize track
- Working demo that runs end-to-end without crashes
- All hard requirements satisfied for all 3 selected tracks
- ≥2 judges cite "real utility" in feedback

**Product success (post-hackathon):**
- 5+ agent developers integrate SimoProof identity in 30 days
- ≥1 protocol team uses SimoProof's ENS-gated agent verification
- Gensyn Foundation grant application submitted (enabled by AXL track win)
- ENSIP-26 (cross-chain agent identity) referenced in technical design

---

## 11. Why SimoProof Wins

**Against the judging criteria:**

| Criterion | SimoProof Score | Why |
|-----------|----------------|-----|
| **Creativity** | High | ENS-anchored AXL discovery is a new primitive; no prior art |
| **Functionality** | High | 3 working demos satisfying 3 separate sponsor hard requirements |
| **Technical Difficulty** | High | 4 protocol integrations (ENS, AXL, KeeperHub, EAS) working in concert |
| **Impact** | High | Solves the agent accountability problem that every onchain protocol will face |

**The meta-narrative that resonates with judges:**  
SimoProof is not a toy demo. It is the infrastructure that answers "who is that agent?" — the question that will be asked a million times as AI agents proliferate across every Ethereum protocol. The ENS + AXL + KeeperHub stack is provably real, the problem is provably unsolved, and the demo is provably working. The timing, with ENSIP-25 and ERC-8004 having gone live this year, makes it feel inevitable rather than speculative.

---

*Document end. See SPEC for technical implementation details.*
