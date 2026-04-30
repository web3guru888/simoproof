# SimoProof v3 — Verified Discovery Network

> **ETHGlobal Open Agents 2026** — targeting ENS, KeeperHub, and Gensyn prize tracks.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-lightgrey.svg)](docs/LICENSE-DOCS)
[![Foundry Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen)](.github/workflows/ci.yml)
[![Built with Risc0](https://img.shields.io/badge/ZK-Risc0%20v3.0-blueviolet)](https://risczero.com)

A ZK-provable, ENS-native, decentralised protocol for verifying empirical claims about the world. Every discovery generates an on-chain EAS attestation backed by a Risc0 ZK proof, voted on by a 4-agent Simocracy senate, distributed via Gensyn AXL, and anchored to an ENS identity via ENSIP-25 text records.

---

## Architecture

```
Discovery Claim
      │
      ▼
┌─────────────────────┐
│  AXL Pre-Validation │  ← Gensyn 3-node P2P — peers review claim before proving
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Simocracy Senate   │  ← 4 AI agents deliberate: Bayesian · Skeptic · Causal · Replication
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Risc0 zkVM Proof   │  ← Guest program: SHA256 source commits + confidence/consensus gates
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  0G Storage Upload  │  ← Raw source bytes + senate transcript stored immutably
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  EAS Attestation    │  ← On-chain: claim_hash · zk_proof · ipfs_cid · ens_name
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  ENS Text Records   │  ← ENSIP-25: axl_pubkey · capabilities · discoveries_count · latest_eas_uid
└─────────────────────┘
```

---

## Prize Tracks

| Sponsor | Track | Integration |
|---------|-------|-------------|
| **ENS** | Best AI Agent Integration | ENSIP-25 text records — each node registers an ENS subname storing its AXL pubkey, capabilities, and discovery history. Novel primitive: ENS as the discovery layer for encrypted P2P agent coordination. |
| **KeeperHub** | Best Use + Feedback Bounty | 5 automated workflows (poll → validate → prove → attest → ens-update) via KeeperHub's MCP-native SDK. See [`FEEDBACK.md`](FEEDBACK.md). |
| **Gensyn** | Best AXL Application | 3-node AXL P2P network for claim pre-validation. AXL pubkeys stored in ENS text records for permissionless peer discovery. |

---

## Project Structure

```
simoproof/
├── packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── mock-discovery/   # 5 fixture discoveries (World Bank, NASA, WHO, NSIDC)
│   ├── simocracy/        # 4-agent senate (ATProto full / mini-senate fallback)
│   ├── axl/              # Gensyn AXL 3-node P2P network
│   ├── chain/            # ENS ENSIP-25 + EAS attestations + DiscoveryVerifier
│   ├── storage/          # 0G decentralised storage upload
│   ├── keeperhub/        # KeeperHub MCP server + 5 automated workflows
│   └── api/              # Express API server + full 7-step pipeline
├── crates/
│   ├── simoproof-guest/  # Risc0 zkVM guest (RISC-V, SHA256 source proofs)
│   └── simoproof-prover/ # CLI prover host (called by TypeScript pipeline)
├── contracts/
│   ├── src/DiscoveryVerifier.sol   # Verifies Risc0 proofs + creates EAS attestations
│   ├── test/DiscoveryVerifier.t.sol
│   └── script/Deploy.s.sol
├── sims/                 # 4 Sim constitutions (SKILL.md)
├── docs/                 # Documentation (CC BY 4.0)
├── scripts/
│   ├── demo.ts           # End-to-end pipeline runner
│   ├── setup.ts          # Environment validation
│   └── verify.ts         # On-chain proof verification
├── FEEDBACK.md           # KeeperHub integration feedback (prize requirement)
├── PLAN.md               # Hackathon submission plan
├── docker-compose.yml    # 3-node AXL network
└── .github/workflows/    # CI: TypeScript + Foundry + Rust check
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 22, npm ≥ 10
- Rust stable (via [rustup](https://rustup.rs))
- Foundry ([installation guide](https://book.getfoundry.sh/getting-started/installation))
- Risc0 toolchain via `rzup`

### Install

```bash
git clone https://github.com/web3guru888/simoproof
cd simoproof
npm install
cp .env.example .env   # fill in your keys — see Environment Variables below
```

### Build Rust Prover (first time: 15–30 min)

```bash
# Install rzup and Risc0 toolchains
cargo install rzup
rzup install rust    # riscv32im-risc0-zkvm-elf (~400MB)
rzup install r0vm    # r0vm execution environment (~200MB)

# Build
RISC0_DEV_MODE=true cargo build -p simoproof-prover --release
```

### Run Demo (Dev Mode — no real keys needed)

```bash
# Single discovery (~10 seconds)
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --discovery disc-001 --skip-onchain

# All 5 fixture discoveries (~50 seconds)
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all --skip-onchain
```

### Run Full Pipeline (Production)

```bash
# Requires real .env values: PRIVATE_KEY, BONSAI_API_KEY, ENS_SUBNAME, deployed contract
npx tsx scripts/demo.ts --all
```

### Start API Server

```bash
npx tsx packages/api/src/server.ts
curl http://localhost:3000/health
curl http://localhost:3000/api/discoveries
```

### Build & Test Contracts

```bash
cd contracts
forge install foundry-rs/forge-std --no-git
forge build
forge test -vv   # 8/8 tests pass
```

### Start 3-Node AXL Network

```bash
docker compose up   # spins up simoproof-node-1/2/3
# or manually:
/path/to/axl start --name node-1 --api-port 7001 --tcp-port 9001
/path/to/axl start --name node-2 --api-port 7002 --tcp-port 9002 --peer tls://127.0.0.1:9001
/path/to/axl start --name node-3 --api-port 7003 --tcp-port 9003 --peer tls://127.0.0.1:9001
```

---

## How the ZK Proof Works

The Risc0 guest program (`crates/simoproof-guest`) runs inside the zkVM and proves:

1. **Source integrity:** `SHA256(raw_source_bytes[i]) == api_source_hashes[i]` for every source — proves the claim was derived from the stated data
2. **Confidence gate:** `confidence >= 0.85`
3. **Consensus gate:** `senate_votes >= 3 out of 4`
4. **Causal validity:** at least one source with `confidence >= 0.70`

Public outputs committed to the journal (visible on-chain): `claim_hash`, `source_commitment`, `consensus_hash`, boolean gate results, timestamp.

In production, Bonsai generates a Groth16 receipt which is verified by the `DiscoveryVerifier` contract on Base Sepolia. In dev mode (`RISC0_DEV_MODE=true`), a fake receipt is used — 10x faster, useful for testing the full pipeline locally.

---

## ENS Integration (ENSIP-25)

Each verifier node registers as `<name>.eth` and writes ENSIP-25 text records:

| Record | Value | Purpose |
|--------|-------|---------|
| `axl_pubkey` | AXL node public key | P2P peer discovery without central registry |
| `capabilities` | `climate,health,ecology` | Claim type routing |
| `agent_type` | `simoproof-verifier` | Agent identity |
| `protocol_version` | `3.0.0` | Versioning |
| `discoveries_count` | `5` | Running total of verified claims |
| `latest_eas_uid` | `0xabc...` | Most recent attestation pointer |

**Novel primitive:** Storing AXL pubkeys in ENS text records makes ENS the coordination layer for encrypted P2P agent discovery — no centralised peer registry required.

---

## Simocracy Senate

Four parallel AI agents deliberate on each claim before it is proven:

| Agent | Role |
|-------|------|
| **Bayesian Reasoner** | Probabilistic assessment of evidence quality |
| **Domain Skeptic** | Challenges methodology and data sources |
| **Causal Analyst** | Evaluates directionality and confounders |
| **Replication Auditor** | Checks for reproducibility and peer review |

Consensus requires 3/4 endorsements. The transcript is hashed (`keccak256`) and committed inside the ZK proof — making senate deliberation cryptographically verifiable on-chain.

---

## Environment Variables

See [`.env.example`](.env.example) for the complete list. Key variables:

| Variable | Description |
|----------|-------------|
| `PRIVATE_KEY` | Wallet private key for ENS writes + chain transactions |
| `BONSAI_API_KEY` | Risc0 Bonsai API key for Groth16 production proofs |
| `SEPOLIA_RPC` | Ethereum Sepolia RPC URL (Alchemy/Infura) |
| `BASE_SEPOLIA_RPC` | Base Sepolia RPC URL |
| `ENS_SUBNAME` | Your ENS subname (e.g. `node-1.simoproof.eth`) |
| `DISCOVERY_VERIFIER_ADDRESS` | Deployed `DiscoveryVerifier.sol` address |
| `DISCOVERY_SCHEMA_UID` | EAS schema UID on Base Sepolia |
| `OPENAI_API_KEY` | For Simocracy mini-senate deliberation |
| `KEEPERHUB_API_KEY` | KeeperHub automation API key |
| `RISC0_DEV_MODE` | `true` = fast fake receipts; unset = production Groth16 |

---

## Fixture Discoveries

Five real-world empirical claims with actual API response bytes (World Bank, NASA, WHO, NSIDC):

| ID | Claim | Confidence |
|----|-------|-----------|
| `disc-001` | Thailand per-capita CO₂ emissions exceeded 4.0t in 2022 | 0.91 |
| `disc-002` | Global avg surface temp anomaly reached +1.45°C | 0.97 |
| `disc-003` | PM2.5 > 100 µg/m³ correlates with +23% respiratory hospitalisations | 0.87 |
| `disc-004` | Arctic sea ice September 2023 — lowest extent on record | 0.99 |
| `disc-005` | Amazon deforestation accelerated 12% in 2022 | 0.89 |

---

## License

- **Code:** [Apache License 2.0](LICENSE)
- **Documentation:** [Creative Commons Attribution 4.0 (CC BY 4.0)](docs/LICENSE-DOCS)

Copyright 2026 web3guru888
