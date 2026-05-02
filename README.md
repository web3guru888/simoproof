# SimoProof v3 — Verified Discovery Network

> **ETHGlobal Open Agents 2026** — targeting ENS · Gensyn AXL · KeeperHub prize tracks.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-lightgrey.svg)](docs/LICENSE-DOCS)
[![Foundry Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen)](.github/workflows/ci.yml)
[![Built with Risc0](https://img.shields.io/badge/ZK-Risc0%20v3.0-blueviolet)](https://risczero.com)
[![ENS](https://img.shields.io/badge/ENS-node--1.simoproof.eth-blue)](https://app.ens.domains/node-1.simoproof.eth)
[![Live Demo](https://img.shields.io/badge/Demo-simoproof.org-brightgreen)](https://simoproof.org)

**SimoProof** is a ZK-provable, ENS-native, decentralised protocol for verifying empirical claims about the world. Every discovery is voted on by a 4-agent AI senate powered by **ASI:One**, pre-validated on the **Gensyn AXL** P2P mesh, proven with a **RISC Zero** ZK proof, attested permanently on-chain via **EAS** on Base Sepolia, stored on **0G Network**, and anchored to an **ENS** identity via ENSIP-25 text records — with the entire lifecycle automated by **KeeperHub** workflows.

🌐 **Live interactive demo:** [simoproof.org](https://simoproof.org)

---

## 🚀 Live Deployments (Testnet)

| Component | Network | Address / Name |
|-----------|---------|----------------|
| **DiscoveryVerifier.sol** | Base Sepolia (84532) | [`0x902e138Be827c6AE8504Cfd2E54caeb2910690Dc`](https://sepolia.basescan.org/address/0x902e138Be827c6AE8504Cfd2E54caeb2910690Dc) |
| **MockRiscZeroVerifier** | Base Sepolia (84532) | [`0x844acEb55db4e96a862692C2663BF97DC7E73708`](https://sepolia.basescan.org/address/0x844acEb55db4e96a862692C2663BF97DC7E73708) |
| **EAS Schema** | Base Sepolia | [`0x86704ade…319a2`](https://base-sepolia.easscan.org/schema/view/0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2) |
| **EAS Attestation — disc-001** | Base Sepolia | [`0xd47257e6…7c64`](https://base-sepolia.easscan.org/attestation/view/0xd47257e63d2b5df37b78e33e00151cc63b33499c63c5fdbbe7b5317c167a7c64) |
| **EAS Attestation — disc-002** | Base Sepolia | [`0x882247ee…fa7a`](https://base-sepolia.easscan.org/attestation/view/0x882247eec16952c5e0732bbc4c815d97effa5b2a9e73a8bfae7fa95420eafa7a) |
| **EAS Attestation — disc-003** | Base Sepolia | [`0xf0991d19…eff6`](https://base-sepolia.easscan.org/attestation/view/0xf0991d197a3e1904fd9893a4ab6820ac22aecf01c06fef7e5bfbc64bb3a5eff6) |
| **EAS Attestation — disc-004** | Base Sepolia | [`0x5951be3c…09f6`](https://base-sepolia.easscan.org/attestation/view/0x5951be3cb56cdadeb687e50e4dea5b01865bac2b03ac554d207006a53fff09f6) |
| **EAS Attestation — disc-005** | Base Sepolia | [`0xddeb0ec4…409a`](https://base-sepolia.easscan.org/attestation/view/0xddeb0ec4b6680369965bb12a12e980e045f7862bd9bcf7341073faa99287409a) |
| **ENS Parent** | Sepolia | [`simoproof.eth`](https://app.ens.domains/simoproof.eth) |
| **ENS Node Identity** | Sepolia | [`node-1.simoproof.eth`](https://app.ens.domains/node-1.simoproof.eth) — `discoveries_count=10` |
| **Website** | Cloudflare Pages | [simoproof.org](https://simoproof.org) |
| **RISC Zero Verifier Router** | Base Sepolia | [`0x0b144e07…b711`](https://sepolia.basescan.org/address/0x0b144e07a0826182b6b59788c34b32bfa86fb711) |

---

## 7-Step Pipeline

```
Discovery Claim
      │
      ▼
┌─────────────────────┐
│  1. AXL Ingestion   │  ← Gensyn P2P mesh pre-validation
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  2. Science Senate  │  ← 4 ASI:One AI agents: Bayesian · Skeptic · Causal · Replication
└─────────────────────┘   Need ≥ 2/4 endorsements to proceed
      │
      ▼
┌─────────────────────┐
│  3. RISC Zero Proof │  ← zkVM guest: confidence ≥ 0.85, senate votes ≥ 2, source SHA-256
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  4. 0G Storage      │  ← Proof JSON + senate transcript pinned to 0G Network
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  5. EAS Attestation │  ← DiscoveryVerifier.sol → EAS on Base Sepolia (permanent)
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  6. ENS Update      │  ← ENSIP-25: discoveries_count++, latest_eas_uid updated
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  7. KeeperHub       │  ← 5 automation workflows fire pipeline stage events
└─────────────────────┘
```

---

## Prize Tracks

| Sponsor | Prize | Our Integration |
|---------|-------|-----------------|
| **ENS** | Best AI Agent Integration ($5k) | Every verifier node owns an ENS subname. ENSIP-25 text records store `agent_type`, `capabilities`, `discoveries_count`, and `latest_eas_uid`. ENS is the identity backbone — no centralised registry needed. |
| **Gensyn (AXL)** | Best AXL Application ($5k) | AXL P2P binary pre-validates claims before proof generation. AXL peer IDs are stored in ENS text records — making ENS the permissionless peer discovery registry for the encrypted mesh. |
| **KeeperHub** | Best Use of KeeperHub ($5k) | 5 automated KeeperHub workflows orchestrate every pipeline stage (poll → validate → prove → attest → ens-update). Full MCP server integration. See [`FEEDBACK.md`](FEEDBACK.md). |

> ETHGlobal Open Agents rules allow up to 3 partner prize tracks. The 7-step pipeline is a single unified proof, not three separate integrations.

---

## Project Structure

```
simoproof/
├── packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── mock-discovery/   # 5 fixture discoveries (NSIDC, NASA, WHO, NOAA, World Bank)
│   │   └── fixtures/discoveries.json
│   ├── simocracy/        # 4-agent senate (ASI:One full / mini-senate fallback)
│   │   ├── src/mini-senate.ts
│   │   └── src/constitutions.ts
│   ├── axl/              # Gensyn AXL P2P pre-validation
│   ├── chain/            # ENS ENSIP-25 + EAS attestations + DiscoveryVerifier client
│   ├── storage/          # 0G decentralised storage upload
│   ├── keeperhub/        # KeeperHub MCP server + 5 automated workflows
│   ├── api/              # Express API server + full 7-step pipeline
│   └── web/              # Frontend dashboard (simoproof.org)
│       └── public/index.html   # Interactive demo SPA
├── crates/
│   ├── simoproof-guest/  # RISC Zero zkVM guest (riscv32im, SHA-256 proofs)
│   └── simoproof-prover/ # CLI prover host (compiled binary, invoked by pipeline)
├── contracts/
│   ├── src/DiscoveryVerifier.sol        # On-chain verifier + EAS minter
│   ├── src/MockRiscZeroVerifier.sol     # Dev-mode verifier (always passes)
│   ├── test/DiscoveryVerifier.t.sol     # 8/8 Foundry tests
│   └── script/Deploy.s.sol / DeployMock.s.sol
├── scripts/
│   ├── demo.ts           # End-to-end pipeline runner (--all for all 5 discoveries)
│   ├── register-ens.ts   # ENS name registration helper
│   ├── setup.ts          # Environment validation
│   └── verify.ts         # On-chain proof verification
├── sims/                 # 4 senator constitutions (SKILL.md)
├── docs/
│   ├── PRD.md            # Product requirements
│   ├── SPEC.md           # Technical specification
│   └── LICENSE-DOCS      # CC BY 4.0
├── AI_ATTRIBUTION.md     # AI tool disclosure (ETHGlobal requirement)
├── FEEDBACK.md           # KeeperHub builder feedback (prize requirement)
└── PLAN.md               # Submission timeline (completed ✅)
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 22, npm ≥ 10
- Rust stable (via [rustup](https://rustup.rs))
- Foundry ([getfoundry.sh](https://book.getfoundry.sh/getting-started/installation))
- RISC Zero toolchain via `rzup`

### Install

```bash
git clone https://github.com/web3guru888/simoproof
cd simoproof
npm install
cp .env.example .env   # fill in your keys
```

### Build Rust Prover

```bash
cargo install rzup
rzup install rust    # riscv32im-risc0-zkvm-elf toolchain
rzup install r0vm    # r0vm execution environment

RISC0_DEV_MODE=true cargo build -p simoproof-prover --release
```

### Run Demo (Dev Mode — fastest path, ~30s per discovery)

```bash
# All 5 discoveries, skip on-chain transactions
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all --skip-onchain

# Full pipeline with live testnet transactions
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all
```

### Start API Server

```bash
npx tsx packages/api/src/server.ts

curl http://localhost:3000/health
curl http://localhost:3000/api/discoveries
curl -X POST http://localhost:3000/api/discovery/submit \
  -H "Content-Type: application/json" \
  -d '{"id":"disc-001"}'
```

### Build & Test Contracts

```bash
cd contracts
forge install foundry-rs/forge-std --no-git
forge build --remappings "forge-std/=lib/forge-std/src/"
forge test --remappings "forge-std/=lib/forge-std/src/" -vv
# Expected: 8/8 tests pass
```

---

## How the ZK Proof Works

The RISC Zero guest program (`crates/simoproof-guest`) runs inside the zkVM and proves:

1. **Source integrity** — `SHA256(raw_source_bytes[i]) == declared_hash[i]` for every source
2. **Confidence gate** — `confidence >= 0.85`
3. **Consensus gate** — `senate_votes >= 2 out of 4`
4. **Causal validity** — causal summary present and non-empty

The journal (public outputs visible on-chain): `claim_hash`, `source_commitment`, `consensus_hash`, gate booleans, timestamp.

**Dev mode** (`RISC0_DEV_MODE=true`) generates fast dev receipts locally (~2s per proof) — same pipeline semantics, no Bonsai required.  
**Production** uses Bonsai to generate a Groth16 receipt verified on-chain by `DiscoveryVerifier.sol`.

**Key implementation note:** The on-chain contract uses `abi.decode` (Ethereum ABI encoding), while RISC Zero's `env::commit_slice` uses binary serde. The pipeline ABI-encodes the journal in TypeScript before submitting to the contract — this is by design.

---

## ENS Integration (ENSIP-25)

Each verifier node registers as `<name>.simoproof.eth` on Sepolia and writes ENSIP-25 text records:

| Record | Example Value | Purpose |
|--------|---------------|---------|
| `agent_type` | `verified-discovery-node` | Agent identity classification |
| `capabilities` | `climate,health,ecology` | Claim-type routing |
| `protocol_version` | `3.0` | Version negotiation |
| `schema_uid` | `0x86704a…` | EAS schema pointer |
| `network` | `base-sepolia` | Active attestation network |
| `discoveries_count` | `10` | Running total of verified claims |
| `latest_eas_uid` | `0xddeb0e…` | Pointer to most recent EAS attestation |

**Key insight:** ENS text records act as an on-chain audit log for the agent's verification history — every claim that passes the senate increments `discoveries_count` and updates `latest_eas_uid`.

---

## Simocracy Science Senate (powered by ASI:One)

Four parallel AI senator agents deliberate on each claim via the **ASI:One** API (`https://api.asi1.ai/v1`, OpenAI-compatible). ASI:One is Fetch.ai's Web3-native LLM.

| Agent | Epistemic Role | Constitution |
|-------|---------------|-------------|
| **Bayesian Reasoner** | Posterior probability analysis | ENDORSE if posterior ≥ 0.80 |
| **Domain Skeptic** | Fatal flaw detection | ENDORSE if no fatal flaw found |
| **Causal Analyst** | Causal structure validation | ENDORSE if causal chain structurally sound |
| **Replication Auditor** | Scientific consensus check | ENDORSE if consistent with literature |

Consensus threshold: **2 of 4** endorsements required. The full deliberation transcript is `keccak256`-hashed and committed inside the ZK proof — senate deliberation is cryptographically anchored on-chain.

---

## Fixture Discoveries

Five real-world empirical claims with actual source data (NSIDC, NASA, WHO, NOAA, World Bank):

| ID | Claim | Source | Conf |
|----|-------|--------|------|
| `disc-001` | Arctic sea ice minimum extent in September 2023 was 4.23 million km², among the five lowest on record since 1979 | NSIDC Sea Ice Index v3.0 | 0.97 |
| `disc-002` | Global average surface temperature anomaly reached +1.45°C above pre-industrial baseline in 2023 | NASA GISS / NOAA | 0.97 |
| `disc-003` | PM2.5 concentrations above 100 µg/m³ correlate with a 23% increase in respiratory hospital admissions in urban SE Asia | WHO GHO AQH_29 | 0.87 |
| `disc-004` | Global mean atmospheric CO₂ reached 421.08 ppm in 2023, up from 411.44 ppm in 2019 | NOAA Mauna Loa Observatory | 0.99 |
| `disc-005` | Brazil's forest area declined to 55.1% of total land area in 2022, down from 58.9% in 2018 | World Bank AG.LND.FRST.ZS | 0.89 |

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key values for the deployed testnet instance:

| Variable | Value | Notes |
|----------|-------|-------|
| `DISCOVERY_VERIFIER_ADDRESS` | `0x902e138Be827c6AE8504Cfd2E54caeb2910690Dc` | v2 with MockRiscZeroVerifier |
| `MOCK_RISC0_VERIFIER` | `0x844acEb55db4e96a862692C2663BF97DC7E73708` | Dev-mode proof verifier |
| `DISCOVERY_SCHEMA_UID` | `0x86704ade…319a2` | EAS schema on Base Sepolia |
| `ENS_SUBNAME` | `node-1.simoproof.eth` | ENSIP-25 agent identity |
| `LLM_BASE_URL` | `https://api.asi1.ai/v1` | ASI:One OpenAI-compatible endpoint |
| `LLM_MODEL` | `asi1` | ASI:One model name |
| `KEEPERHUB_BASE_URL` | `https://app.keeperhub.com` | SDK appends `/api` internally |
| `RISC0_DEV_MODE` | `true` | Fast dev receipts (testnet) |

---

## AI Attribution

This project uses **Claude** (Anthropic) as a development assistant and **ASI:One** (Fetch.ai) as the runtime LLM for senate deliberation. See [`AI_ATTRIBUTION.md`](AI_ATTRIBUTION.md) for full disclosure per ETHGlobal transparency requirements.

---

## License

- **Code:** [Apache License 2.0](LICENSE)
- **Documentation:** [Creative Commons Attribution 4.0](docs/LICENSE-DOCS)

Copyright 2026 web3guru888
