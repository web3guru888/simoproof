# SimoProof v3 — Verified Discovery Network

> **ETHGlobal Open Agents 2026** — targeting ENS · KeeperHub · Gensyn prize tracks.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC%20BY%204.0-lightgrey.svg)](docs/LICENSE-DOCS)
[![Foundry Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen)](.github/workflows/ci.yml)
[![Built with Risc0](https://img.shields.io/badge/ZK-Risc0%20v3.0-blueviolet)](https://risczero.com)
[![ENS](https://img.shields.io/badge/ENS-node--1.simoproof.eth-blue)](https://sepolia.app.ens.domains/name/node-1.simoproof.eth)

A ZK-provable, ENS-native, decentralised protocol for verifying empirical claims about the world. Every discovery generates an on-chain EAS attestation backed by a RISC Zero ZK proof, voted on by a 4-agent Simocracy senate powered by **ASI:One**, distributed via Gensyn AXL, and anchored to an ENS identity via ENSIP-25 text records.

---

## 🚀 Live Deployments (Testnet)

| Component | Network | Address / Name |
|-----------|---------|----------------|
| **DiscoveryVerifier.sol** | Base Sepolia (84532) | [`0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6`](https://sepolia.basescan.org/address/0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6) |
| **EAS Schema** | Base Sepolia | [`0x86704ade...319a2`](https://base-sepolia.easscan.org/schema/view/0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2) |
| **RISC Zero Verifier** | Base Sepolia | [`0x0b144e07...b711`](https://sepolia.basescan.org/address/0x0b144e07a0826182b6b59788c34b32bfa86fb711) |
| **ENS Parent** | Sepolia | [`simoproof.eth`](https://sepolia.app.ens.domains/name/simoproof.eth) |
| **ENS Node Identity** | Sepolia | [`node-1.simoproof.eth`](https://sepolia.app.ens.domains/name/node-1.simoproof.eth) |

---

## Architecture

```
Discovery Claim
      │
      ▼
┌─────────────────────┐
│  AXL Pre-Validation │  ← Gensyn 3-node encrypted P2P — peers review claim before proving
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Simocracy Senate   │  ← 4 AI agents via ASI:One: Bayesian · Skeptic · Causal · Replication
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  RISC Zero zkVM     │  ← Guest: SHA-256 source commits + confidence/consensus gates
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
      │
      ▼
┌─────────────────────┐
│  KeeperHub Jobs     │  ← Guaranteed retry + audit trail for every onchain step
└─────────────────────┘
```

---

## Prize Tracks

| Sponsor | Prize | Our Integration |
|---------|-------|-----------------|
| **KeeperHub** | Best Use of KeeperHub ($5k) | MCP server with 5 automated workflows: poll → senate → prove → attest → ens-update. KeeperHub handles guaranteed execution + retries for every onchain step. See [`FEEDBACK.md`](FEEDBACK.md). |
| **Gensyn (AXL)** | Best AXL Application ($5k) | 3-node encrypted P2P pre-validation mesh. Each node's AXL pubkey is stored in its ENS text records — ENS becomes the permissionless peer discovery registry. |
| **ENS** | Best AI Agent Integration ($5k) | Every verifier node owns an ENS subname. ENSIP-25 text records store `axl_pubkey`, `capabilities`, `discoveries_count`, and `latest_eas_uid`. ENS as the coordination layer for encrypted P2P agent identity — no centralised registry. |

> ETHGlobal Open Agents rules allow up to 3 partner prize tracks. SimoProof targets all three above simultaneously — the 7-step pipeline is a single unified proof, not three separate integrations.

---

## Project Structure

```
simoproof/
├── packages/
│   ├── types/            # Shared TypeScript interfaces (Discovery, ZKReceipt, Attestation…)
│   ├── mock-discovery/   # 5 fixture discoveries (World Bank, NASA, WHO, NSIDC)
│   ├── simocracy/        # 4-agent senate (ASI:One full / mini-senate fallback)
│   ├── axl/              # Gensyn AXL 3-node P2P network
│   ├── chain/            # ENS ENSIP-25 + EAS attestations + DiscoveryVerifier
│   ├── storage/          # 0G decentralised storage upload
│   ├── keeperhub/        # KeeperHub MCP server + 5 automated workflows
│   └── api/              # Express API server + full 7-step pipeline
├── crates/
│   ├── simoproof-guest/  # RISC Zero zkVM guest (riscv32im, SHA-256 source proofs)
│   └── simoproof-prover/ # CLI prover host (spawned by TypeScript pipeline)
├── contracts/
│   ├── src/DiscoveryVerifier.sol   # On-chain RISC Zero verifier + EAS attestation minter
│   ├── test/DiscoveryVerifier.t.sol  # 8/8 Foundry tests passing
│   └── script/Deploy.s.sol
├── scripts/
│   ├── demo.ts           # End-to-end pipeline runner
│   ├── register-ens.ts   # ENS name registration helper (Sepolia)
│   ├── setup.ts          # Environment validation
│   └── verify.ts         # On-chain proof verification
├── sims/                 # 4 senator constitutions (SKILL.md)
├── docs/
│   ├── PRD.md            # Product requirements
│   ├── SPEC.md           # Technical specification
│   └── LICENSE-DOCS      # CC BY 4.0
├── AI_ATTRIBUTION.md     # AI tool disclosure (ETHGlobal requirement)
├── FEEDBACK.md           # KeeperHub builder feedback (prize requirement)
├── PLAN.md               # 48-hour submission timeline
└── docker-compose.yml    # 3-node AXL network
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
cp .env.example .env   # fill in your keys — see Environment Variables below
```

### Build Rust Prover (first time: 15–30 min)

```bash
# Install rzup and RISC Zero toolchains
cargo install rzup
rzup install rust    # riscv32im-risc0-zkvm-elf toolchain (~400 MB)
rzup install r0vm    # r0vm execution environment (~200 MB)

# Build
RISC0_DEV_MODE=true cargo build -p simoproof-prover --release
```

### Run Demo (Dev Mode — fastest path)

```bash
# All 5 fixture discoveries through the full pipeline (~50 seconds)
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all --skip-onchain

# Single discovery
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --discovery disc-001 --skip-onchain
```

### Run Full Pipeline (Live Testnet)

```bash
# Requires: PRIVATE_KEY, ENS_SUBNAME, deployed contract + schema in .env
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

### Deploy Contracts (already deployed — for reference)

```bash
cd contracts
export RISC0_VERIFIER_ADDRESS=0x0b144e07a0826182b6b59788c34b32bfa86fb711
export GUEST_IMAGE_ID=0x4220fefa6dab2f88ffeeeb5048ae2df22385f2e00cfd5c12b1ab33e00b718ba2

forge script script/Deploy.s.sol \
  --remappings "forge-std/=lib/forge-std/src/" \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast --legacy
```

### Register ENS Name (already registered — for reference)

```bash
npx tsx scripts/register-ens.ts
# Registers <label>.eth on Sepolia + creates node-1.<label>.eth subname
```

---

## How the ZK Proof Works

The RISC Zero guest program (`crates/simoproof-guest`) runs inside the zkVM and proves:

1. **Source integrity** — `SHA256(raw_source_bytes[i]) == declared_hash[i]` for every source
2. **Confidence gate** — `confidence >= 0.85`
3. **Consensus gate** — `senate_votes >= 3 out of 4`
4. **Causal validity** — at least one source with `causal_confidence >= 0.70`

Public journal outputs (visible on-chain): `claim_hash`, `source_commitment`, `consensus_hash`, gate booleans, timestamp.

**Dev mode** (`RISC0_DEV_MODE=true`) generates fast fake receipts locally — same pipeline, no Bonsai needed.  
**Production** uses Bonsai to generate a Groth16 receipt, verified on-chain by `DiscoveryVerifier.sol`.

---

## ENS Integration (ENSIP-25)

Each verifier node registers as `<name>.eth` on Sepolia and writes ENSIP-25 text records:

| Record | Example Value | Purpose |
|--------|---------------|---------|
| `axl_pubkey` | `ed25519:abc123…` | AXL P2P peer discovery |
| `capabilities` | `climate,health,ecology` | Claim-type routing |
| `agent_type` | `simoproof-verifier` | Agent identity standard |
| `protocol_version` | `3.0` | Version negotiation |
| `discoveries_count` | `5` | Running total of verified claims |
| `latest_eas_uid` | `0xabc…` | Pointer to most recent EAS attestation |

**Key insight:** storing AXL pubkeys in ENS text records makes ENS the coordination layer for the encrypted P2P network — no centralised peer registry required.

---

## Simocracy Senate (powered by ASI:One)

Four parallel AI senator agents deliberate on each claim via the **ASI:One** API (`https://api.asi1.ai/v1`, OpenAI-compatible). ASI:One is Fetch.ai's Web3-native LLM — a deliberate choice for a decentralised science protocol.

| Agent | Epistemic Role |
|-------|---------------|
| **Bayesian Reasoner** | Probabilistic assessment of evidence strength |
| **Domain Skeptic** | Challenges methodology and data quality |
| **Causal Analyst** | Evaluates causality, confounders, effect direction |
| **Replication Auditor** | Checks reproducibility and peer-review status |

Consensus threshold: **3 of 4** endorsements required. The full deliberation transcript is `keccak256`-hashed and committed inside the ZK proof — senate deliberation is cryptographically verifiable on-chain.

---

## Fixture Discoveries

Five real-world empirical claims with actual API response bytes (World Bank, NASA, WHO, NSIDC):

| ID | Claim | Confidence |
|----|-------|------------|
| `disc-001` | Thailand per-capita CO₂ emissions exceeded 4.0 t in 2022 | 0.91 |
| `disc-002` | Global average surface temp anomaly reached +1.45 °C | 0.97 |
| `disc-003` | PM2.5 > 100 µg/m³ correlates with +23 % respiratory hospitalisations | 0.87 |
| `disc-004` | Arctic sea ice September 2023 — lowest extent on record | 0.99 |
| `disc-005` | Amazon deforestation accelerated 12 % in 2022 | 0.89 |

---

## Environment Variables

See [`.env.example`](.env.example) for the full list with comments. All values below have been set for the deployed testnet instance.

| Variable | Description | Status |
|----------|-------------|--------|
| `PRIVATE_KEY` | Deployer wallet | ✅ set |
| `SEPOLIA_RPC` | Ethereum Sepolia RPC | ✅ `publicnode.com` |
| `BASE_SEPOLIA_RPC` | Base Sepolia RPC | ✅ `publicnode.com` |
| `DISCOVERY_VERIFIER_ADDRESS` | Deployed contract on Base Sepolia | ✅ `0x5508C6…` |
| `DISCOVERY_SCHEMA_UID` | EAS schema on Base Sepolia | ✅ `0x86704a…` |
| `RISC0_VERIFIER_ADDRESS` | RISC Zero router (Base Sepolia) | ✅ `0x0b144e…` |
| `GUEST_IMAGE_ID` | zkVM guest image ID (bytes32) | ✅ `0x4220fe…` |
| `ENS_SUBNAME` | Node identity subname | ✅ `node-1.simoproof.eth` |
| `OPENAI_API_KEY` | ASI:One API key | ✅ set |
| `LLM_BASE_URL` | ASI:One endpoint | ✅ `https://api.asi1.ai/v1` |
| `LLM_MODEL` | Model | ✅ `asi1` |
| `KEEPERHUB_API_KEY` | KeeperHub org API key | ✅ set |
| `KEEPERHUB_BASE_URL` | KeeperHub API base | ✅ `https://app.keeperhub.com/api` |
| `RISC0_DEV_MODE` | `true` = fast dev receipts | ✅ `true` (testnet) |
| `AXL_BINARY_PATH` | Path to AXL binary | ✅ `/workspace/axl-node` |
| `ZERO_G_RPC_URL` | 0G testnet RPC | ✅ set |

---

## AI Attribution

This project uses **Claude** (Anthropic) as a development assistant and **ASI:One** (Fetch.ai) as the runtime LLM for senate deliberation. See [`AI_ATTRIBUTION.md`](AI_ATTRIBUTION.md) for full disclosure per ETHGlobal transparency requirements.

---

## Spec-Driven Development

This project followed a spec-driven workflow (permitted and encouraged by ETHGlobal rules):

1. **Research** — verified all protocol claims against primary sources (ENS EIPs, Gensyn AXL docs, RISC Zero contracts, KeeperHub API)
2. **PRD** — [`docs/PRD.md`](docs/PRD.md): goals, user stories, success criteria
3. **SPEC** — [`docs/SPEC.md`](docs/SPEC.md): module interfaces, data flows, contract schemas
4. **Implementation** — code generated to satisfy SPEC
5. **Testing** — 8/8 Foundry tests, full pipeline smoke test

---

## License

- **Code:** [Apache License 2.0](LICENSE)
- **Documentation:** [Creative Commons Attribution 4.0](docs/LICENSE-DOCS)

Copyright 2026 web3guru888
