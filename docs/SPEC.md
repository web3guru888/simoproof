# SimoProof — Technical Specification
**Version:** 2.0 (updated May 2, 2026 — reflects as-built system)  
**Date:** 2026-05-02  
**Target Event:** ETHGlobal Open Agents (April 24 – May 6, 2026)  
**Selected Prize Tracks:** ENS + KeeperHub + Gensyn AXL  
**Status:** ✅ IMPLEMENTED

---

## 1. System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              SimoProof Node              │
                    │         node-1.simoproof.eth             │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │           7-Step Pipeline                │
                    │                                         │
                    │  [1] AXL Broadcast (Gensyn)             │
                    │       ↓                                  │
                    │  [2] Simocracy Senate (ASI:One LLM)      │
                    │       4 senators, 2/4 threshold          │
                    │       ↓                                  │
                    │  [3] RISC Zero ZK Proof                  │
                    │       Rust guest program                 │
                    │       ↓                                  │
                    │  [4] 0G Storage Upload                   │
                    │       testnet.0g.ai                      │
                    │       ↓                                  │
                    │  [5] EAS Attestation (Base Sepolia)      │
                    │       DiscoveryVerifier.sol              │
                    │       ↓                                  │
                    │  [6] ENS Text Record Update              │
                    │       ENSIP-25 (Sepolia)                 │
                    │       ↓                                  │
                    │  [7] KeeperHub Workflow Log              │
                    │       app.keeperhub.com                  │
                    └─────────────────────────────────────────┘
                                       │
              ┌────────────────────────▼────────────────────────┐
              │                 Cloudflare Pages                 │
              │              https://simoproof.org               │
              │          Interactive Demo Frontend               │
              └─────────────────────────────────────────────────┘
```

### Live Deployments

| Component | Network | Address / Value |
|-----------|---------|-----------------|
| `DiscoveryVerifier.sol` | Base Sepolia (84532) | `0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6` |
| `MockRiscZeroVerifier` | Base Sepolia (84532) | Deployed with DiscoveryVerifier |
| EAS Schema UID | Base Sepolia | `0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2` |
| RISC Zero Verifier Router | Base Sepolia | `0x0b144e07a0826182b6b59788c34b32bfa86fb711` |
| Guest Image ID | — | `0x4220fefa6dab2f88ffeeeb5048ae2df22385f2e00cfd5c12b1ab33e00b718ba2` |
| `simoproof.eth` | Sepolia | `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580` |
| `node-1.simoproof.eth` | Sepolia | `0xB05741aF6f90666Ce27372001CEfC36Cab9bE580` |
| Frontend | Cloudflare Pages | https://simoproof.org |

---

## 2. Repository Structure

```
simoproof/
├── contracts/                    # Solidity smart contracts (Foundry)
│   ├── src/
│   │   └── DiscoveryVerifier.sol # Main verification contract + EAS integration
│   ├── script/
│   │   └── Deploy.s.sol          # Foundry deployment script
│   ├── test/
│   │   └── DiscoveryVerifier.t.sol # 8 passing tests
│   └── foundry.toml
│
├── packages/
│   ├── axl/                      # Gensyn AXL integration
│   │   └── src/axl-client.ts     # AXL broadcast + peer pre-validation
│   │
│   ├── simocracy/                # 4-agent deliberation senate
│   │   └── src/senate.ts         # Senate runner, ASI:One LLM calls, consensus
│   │
│   ├── prover/                   # RISC Zero ZK prover
│   │   ├── src/main.rs           # Rust guest program
│   │   ├── Cargo.toml
│   │   └── build.sh              # Compiles Rust → guest binary
│   │
│   ├── zero-g/                   # 0G decentralized storage
│   │   └── src/storage.ts        # Upload source data to 0G testnet
│   │
│   ├── eas/                      # EAS attestation
│   │   └── src/attest.ts         # Submit attestation to DiscoveryVerifier
│   │
│   ├── ens/                      # ENS / ENSIP-25 integration
│   │   └── src/ens-updater.ts    # Update text records on node-1.simoproof.eth
│   │
│   ├── keeperhub/                # KeeperHub MCP server
│   │   ├── src/server.ts         # MCP server (6 tools)
│   │   └── src/jobs.ts           # 5 KeeperHub workflow creation
│   │
│   ├── api/                      # Express REST API
│   │   └── src/server.ts         # /health, /api/discoveries, /api/discovery/submit
│   │
│   ├── mock-discovery/           # Test fixtures
│   │   └── fixtures/
│   │       └── discoveries.json  # 5 pre-loaded discovery fixtures
│   │
│   └── web/                      # Frontend demo
│       └── public/index.html     # Single-page "Scientific Tribunal" UI
│
├── scripts/
│   └── demo.ts                   # Main pipeline runner (--all, --discovery disc-001)
│
├── sims/                         # Senator constitutions
│   ├── bayesian-reasoner/SKILL.md
│   ├── causal-analyst/SKILL.md
│   ├── domain-skeptic/SKILL.md
│   └── replication-auditor/SKILL.md
│
├── docs/
│   ├── PRD.md                    # Product Requirements Document
│   └── SPEC.md                   # This file
│
├── FEEDBACK.md                   # ← REQUIRED: KeeperHub feedback bounty (repo root)
├── AI_ATTRIBUTION.md             # AI tool disclosure
├── PLAN.md                       # Submission plan + evidence checklist
├── README.md                     # Project overview + setup
├── package.json                  # pnpm workspaces monorepo root
└── .env.example                  # Environment template (no real keys)
```

> ⚠️ **FEEDBACK.md must be at repo root** — required for KeeperHub feedback bounty eligibility.

---

## 3. Smart Contracts

### 3.1 DiscoveryVerifier.sol

**Network:** Base Sepolia (84532)  
**Address:** `0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6`  
**Purpose:** Verify RISC Zero ZK receipts and create EAS attestations for verified discoveries.

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title DiscoveryVerifier
 * @notice Verifies RISC Zero proofs for empirical discoveries and creates EAS attestations.
 * @dev Deployed on Base Sepolia. Uses MockRiscZeroVerifier in RISC0_DEV_MODE.
 */
contract DiscoveryVerifier {
    // EAS on Base Sepolia
    IEAS public immutable eas;
    // RISC Zero verifier (real or mock depending on deploy mode)
    IRiscZeroVerifier public immutable riscZeroVerifier;
    // Schema UID: bytes32,bytes32,bytes32,bytes,string,address,string
    bytes32 public immutable schemaUID;
    // Guest image ID for the prover
    bytes32 public immutable imageId;

    event DiscoveryVerified(
        bytes32 indexed claimHash,
        bytes32 indexed uid,
        address indexed node,
        string ensName
    );

    /**
     * @notice Submit a verified discovery
     * @param claimHash      keccak256 of the claim text
     * @param sourceCommit   keccak256 of the source data
     * @param consensusHash  keccak256 of senate votes
     * @param zkProof        RISC Zero Groth16 receipt (or dev-mode receipt)
     * @param storageCid     0G storage CID
     * @param ensName        ENS name of verifying node
     */
    function submitDiscovery(
        bytes32 claimHash,
        bytes32 sourceCommit,
        bytes32 consensusHash,
        bytes calldata zkProof,
        string calldata storageCid,
        string calldata ensName
    ) external returns (bytes32 uid) {
        // Verify the ZK proof
        riscZeroVerifier.verify(zkProof, imageId,
            sha256(abi.encode(claimHash, sourceCommit, consensusHash))
        );

        // Create EAS attestation
        uid = eas.attest(AttestationRequest({
            schema: schemaUID,
            data: AttestationRequestData({
                recipient: msg.sender,
                expirationTime: 0,
                revocable: true,
                refUID: bytes32(0),
                data: abi.encode(
                    claimHash, sourceCommit, consensusHash,
                    zkProof, storageCid, msg.sender, ensName
                ),
                value: 0
            })
        }));

        emit DiscoveryVerified(claimHash, uid, msg.sender, ensName);
    }
}
```

**Tests:** 8/8 Foundry tests passing in `contracts/test/DiscoveryVerifier.t.sol`

```bash
# Run tests
cd contracts && forge test --gas-report

# Deploy to Base Sepolia
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

### 3.2 EAS Schema (Base Sepolia)

**Schema UID:** `0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2`  
**Explorer:** https://base-sepolia.easscan.org/schema/view/0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2

```
Schema: bytes32 claim_hash, bytes32 source_commitment, bytes32 consensus_hash, bytes zk_proof, string ipfs_cid, address atlas_node, string ens_name
Resolver: 0x0000000000000000000000000000000000000000
Revocable: true
```

**Live Attestations (5 confirmed):**

| Discovery | Claim | EAS UID |
|-----------|-------|---------|
| disc-001 | Arctic sea ice Sep 2023: 4.23M km² (NSIDC) | `0xd47257e63d2b5df37b78e33e00151cc63b33499c63c5fdbbe7b5317c167a7c64` |
| disc-002 | Global surface temp +1.45°C (NOAA/WMO) | `0x882247eec16952c5e0732bbc4c815d97effa5b2a9e73a8bfae7fa95420eafa7a` |
| disc-003 | Atmospheric CO₂ 421.08 ppm (Mauna Loa 2023) | `0x5951be3cb56cdadeb687e50e4dea5b01865bac2b03ac554d207006a53fff09f6` |
| disc-004 | PM2.5 concentrations — IQ Air 2023 | `0xf0991d197a3e1904fd9893a4ab6820ac22aecf01c06fef7e5bfbc64bb3a5eff6` |
| disc-005 | Brazil forest area — FAO 2020 | `0xddeb0ec4b6680369965bb12a12e980e045f7862bd9bcf7341073faa99287409a` |

---

## 4. Simocracy Senate

### 4.1 Architecture

```
                    ┌─────────────────────┐
                    │   Discovery Input    │
                    │  { claim, source,    │
                    │    confidence }      │
                    └──────────┬──────────┘
                               │
              ┌────────────────▼────────────────┐
              │         Senate Runner            │
              │   (packages/simocracy/senate.ts) │
              └────┬─────┬──────┬───────┬───────┘
                   │     │      │       │
            ┌──────▼──┐ ┌▼────┐ ┌▼─────┐ ┌▼──────────┐
            │Bayesian │ │Causal│ │Domain│ │Replication│
            │Reasoner │ │Anlst │ │Skeptic│ │Auditor   │
            └──────┬──┘ └┬────┘ └┬─────┘ └┬──────────┘
                   │     │       │         │
                   └─────┴───────┴─────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Consensus: 2/4      │
                    │   endorsements needed │
                    │   → consensusHash     │
                    └───────────────────────┘
```

### 4.2 Senator Constitutions

Each senator is defined by a SKILL.md in `sims/`:

| Senator | File | Focus |
|---------|------|-------|
| Bayesian Reasoner | `sims/bayesian-reasoner/SKILL.md` | Prior probability, evidence weight, posterior update |
| Causal Analyst | `sims/causal-analyst/SKILL.md` | Causal chain, confounders, alternative explanations |
| Domain Skeptic | `sims/domain-skeptic/SKILL.md` | Null hypothesis defense, extraordinary claims threshold |
| Replication Auditor | `sims/replication-auditor/SKILL.md` | Methodology, peer review status, replication record |

### 4.3 Senate API

```typescript
// packages/simocracy/src/senate.ts

interface SenateInput {
  claim: string;
  source: string;
  confidence: number;
  raw_source_bytes: string;  // base64
}

interface SenateResult {
  endorsed: boolean;          // true if ≥ 2/4 senators endorse
  votes: {
    senator: string;
    vote: 'ENDORSE' | 'REJECT';
    reasoning: string;
  }[];
  consensusHash: string;      // keccak256 of all votes
  endorsementCount: number;
}

async function runSenate(input: SenateInput): Promise<SenateResult>
```

### 4.4 LLM Configuration

```bash
LLM_BASE_URL=https://api.asi1.ai/v1
LLM_MODEL=asi1
OPENAI_API_KEY=<ASI:One key>  # OpenAI-compatible header
```

ASI:One is used as the inference backend. It's an OpenAI-compatible API from Fetch.ai — the same organization that created the Fetch.ai/Agentverse ecosystem. Using it as the senate LLM is thematically consistent: a decentralized science verification network powered by a Web3-native AI.

---

## 5. Gensyn AXL Integration

### 5.1 Pipeline Step 1: AXL Broadcast

```typescript
// packages/axl/src/axl-client.ts

interface AXLBroadcastResult {
  peersReached: number;
  preValidationConsensus: boolean;
  nodeId: string;
  timestamp: number;
}

async function broadcastDiscovery(
  discovery: DiscoveryInput,
  axlBinaryPath: string,
  port: number
): Promise<AXLBroadcastResult>
```

### 5.2 ENS-Anchored AXL Discovery (Novel Primitive)

The AXL pubkey is stored in the ENS text record for `node-1.simoproof.eth`:

```
key: "axl_pubkey"
value: "ed25519:<64-char hex pubkey>"
```

Any agent can:
1. Resolve `node-1.simoproof.eth` 
2. Read `axl_pubkey` text record
3. Connect directly over AXL using that pubkey
4. No centralized registry or DNS required

This is the novel contribution: **ENS as the discovery layer for AXL P2P connections.**

### 5.3 AXL Binary

```bash
# Binary location
/workspace/axl-node

# Start AXL node
/workspace/axl-node start \
  --name simoproof-node-1 \
  --api-port 7001 \
  --tcp-port 9001

# Pipeline uses HTTP API at localhost:7001
```

---

## 6. KeeperHub Integration

### 6.1 MCP Server

```typescript
// packages/keeperhub/src/server.ts

// 6 MCP tools exposed:
const tools = [
  'poll_pending_discoveries',   // poll mock-discovery for pending items
  'run_simocracy_validation',   // run senate on a discovery
  'generate_zk_proof',          // call RISC Zero prover
  'submit_onchain_attestation', // call DiscoveryVerifier.submitDiscovery()
  'update_ens_records',         // update ENSIP-25 text records
  'verify_claim',               // end-to-end pipeline for a single claim
];
```

### 6.2 Workflow Configuration

```typescript
// packages/keeperhub/src/jobs.ts — creates 5 workflows via KeeperHub API

const workflows = [
  {
    name: 'simoproof-poll-discoveries',
    trigger: { type: 'interval', intervalSeconds: 30 },
    steps: [{ action: 'mcp_call', tool: 'poll_pending_discoveries' }]
  },
  {
    name: 'simoproof-validate',
    trigger: { type: 'event', event: 'discovery.pending' },
    steps: [{ action: 'mcp_call', tool: 'run_simocracy_validation' }],
    retry: { attempts: 3, backoff: [10, 30, 90] }
  },
  {
    name: 'simoproof-prove',
    trigger: { type: 'event', event: 'discovery.validated' },
    steps: [{ action: 'mcp_call', tool: 'generate_zk_proof' }],
    retry: { attempts: 3, backoff: [60, 180, 600] }
  },
  {
    name: 'simoproof-attest',
    trigger: { type: 'event', event: 'discovery.proved' },
    steps: [{ action: 'mcp_call', tool: 'submit_onchain_attestation' }],
    retry: { attempts: 3, backoff: [30, 90, 300] }
  },
  {
    name: 'simoproof-ens-update',
    trigger: { type: 'event', event: 'discovery.attested' },
    steps: [{ action: 'mcp_call', tool: 'update_ens_records' }]
  }
];
```

### 6.3 API Configuration

```bash
KEEPERHUB_API_KEY=kh_zcBcSoMYrZxO--I7GzR8PNG-2zT_WX7_
KEEPERHUB_BASE_URL=https://app.keeperhub.com    # NOTE: no /api suffix
```

> ⚠️ **Base URL gotcha:** The KeeperHub API base URL is `https://app.keeperhub.com` — **without** `/api` suffix. Using `/api` causes 404s.

---

## 7. 0G Storage Integration

```typescript
// packages/zero-g/src/storage.ts

interface StorageResult {
  cid: string;          // content ID
  txHash: string;       // 0G upload transaction
  network: 'testnet';
}

async function uploadToZeroG(
  data: Buffer,
  rpcUrl: string       // https://evmrpc-testnet.0g.ai
): Promise<StorageResult>
```

**Configuration:**
```bash
ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai
```

---

## 8. ENS / ENSIP-25 Integration

### 8.1 Text Records Written Per Discovery

```typescript
// packages/ens/src/ens-updater.ts

const ENSIP25_RECORDS = {
  ens_name:        'node-1.simoproof.eth',
  capabilities:    '["verify","attest","store"]',
  axl_pubkey:      '<ed25519 pubkey hex>',
  discoveries_count: String(currentCount + 1),
  latest_eas_uid:  easAttestationUID,
};

// Update via ethers.js + Sepolia PublicResolver
await resolver.setText(nameHash, key, value);
```

### 8.2 Live ENS State

```
node-1.simoproof.eth (Sepolia)
├── ens_name          = "node-1.simoproof.eth"
├── capabilities      = ["verify","attest","store"]
├── axl_pubkey        = "ed25519:..."
├── discoveries_count = "10"
└── latest_eas_uid    = "0xd47257..."
```

**ENSIP-25 reference:** https://docs.ens.domains/building-with-ai/

---

## 9. Frontend Demo (simoproof.org)

### 9.1 Design System

**Aesthetic:** "Scientific Tribunal" — the opposite of generic web3 purple gradients.

| Variable | Value |
|----------|-------|
| `--bg` | `#090d08` (dark forest green) |
| `--lime` | `#aaff00` (acid chartreuse) |
| `--coral` | `#ff4040` (verdict red) |
| Headline font | `DM Serif Display` |
| Data/code font | `JetBrains Mono` |
| UI font | `Outfit` |
| Background | Graph-paper grid (40px, lime at 3% opacity) |
| Overlay | SVG grain filter (feTurbulence, 0.35 opacity) |

### 9.2 Senate Cards (3D Flip)

```css
.flip-wrap { perspective: 800px; height: 168px; }
.flip-inner {
  transform-style: preserve-3d;
  transition: transform .55s cubic-bezier(.42,0,.17,1.2);
}
.flip-inner.flipped { transform: rotateY(180deg); }
.flip-face { backface-visibility: hidden; }
.flip-back { transform: rotateY(180deg); }
```

### 9.3 Preset Claims with Real EAS UIDs

Each preset claim in the frontend maps to a confirmed on-chain attestation:

```javascript
const PRESETS = [
  {
    claim: 'Arctic sea ice minimum extent in September 2023...',
    easUid: '0xd47257e63d2b5df37b78e33e00151cc63b33499c63c5fdbbe7b5317c167a7c64',
    source: 'NSIDC Sea Ice Index v3.0',
    confidence: 0.97
  },
  // ... 4 more presets
];
```

When a judge clicks "View EAS →", they land on the actual live attestation at:
`https://base-sepolia.easscan.org/attestation/view/{real_uid}`

### 9.4 Custom Claim Mode

Users can enter any custom claim. For custom claims:
- Senate simulation runs with pre-programmed deliberation timing (~3-4s per senator)
- EAS link goes to schema view (since no real attestation exists)
- Full pipeline animation plays with all 7 steps

### 9.5 Deployment

**Cloudflare Pages** — static deploy from `packages/web/dist/`:
```bash
cd packages/web && npm run build
wrangler pages deploy dist/ --project-name simoproof --branch main
```

---

## 10. Pipeline Runner

```typescript
// scripts/demo.ts — main pipeline orchestrator

// Run all 5 discoveries
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all

// Run single discovery
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --discovery disc-001

// Skip onchain txs (fastest — for demos)
RISC0_DEV_MODE=true npx tsx scripts/demo.ts --all --skip-onchain
```

**Pipeline timing (RISC0_DEV_MODE=true):**
- Single discovery: ~10s
- All 5 discoveries: ~50s

**Pipeline timing (production mode):**
- Single discovery: ~3-5 min (Groth16 proof generation)
- All 5 discoveries: ~15-25 min

---

## 11. Environment Variables

```bash
# .env.example — see .env for real values (not committed)

# Ethereum
PRIVATE_KEY=0x...
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
BASE_SEPOLIA_RPC=https://base-sepolia-rpc.publicnode.com

# Contracts (Base Sepolia)
DISCOVERY_VERIFIER_ADDRESS=0x5508C6aC4E85C3458bfceaD1DBcE1F66bf78c1E6
DISCOVERY_SCHEMA_UID=0x86704ade90c66f1fc5071d0a00e8d0c5055f4c5048d8ae2d7866cf55b3a319a2
RISC0_VERIFIER_ADDRESS=0x0b144e07a0826182b6b59788c34b32bfa86fb711
GUEST_IMAGE_ID=0x4220fefa6dab2f88ffeeeb5048ae2df22385f2e00cfd5c12b1ab33e00b718ba2

# ENS (Sepolia)
ENS_SUBNAME=node-1.simoproof.eth

# RISC Zero
RISC0_DEV_MODE=true  # set to false for real Groth16 proofs

# LLM (ASI:One — senate)
OPENAI_API_KEY=<ASI:One key>
LLM_BASE_URL=https://api.asi1.ai/v1
LLM_MODEL=asi1

# KeeperHub
KEEPERHUB_API_KEY=<keeperhub key>
KEEPERHUB_BASE_URL=https://app.keeperhub.com    # no /api suffix!

# Gensyn AXL
AXL_BINARY_PATH=/workspace/axl-node

# 0G Storage
ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai
```

---

## 12. Submission Checklist

### Hard Requirements ✅
- [x] **FEEDBACK.md exists at repo root** (KeeperHub feedback bounty)
- [x] AXL integration — broadcast in pipeline step 1
- [x] ENS demo has no hard-coded values — all resolution is live on Sepolia
- [x] KeeperHub integration uses MCP server (`packages/keeperhub/`)
- [x] Only 3 partner prizes selected: ENS + KeeperHub + Gensyn AXL
- [ ] Demo video is ≤ 3 minutes ← record this morning

### Required Submission Fields
- [ ] Project title: **SimoProof**
- [ ] Short description: *"7-step verified discovery network: empirical claims deliberated by a 4-agent Simocracy senate, proven with RISC Zero ZK receipts, attested on Base via EAS, stored on 0G, and anchored to ENS identity via ENSIP-25. Who verified that claim? Now you can know — on-chain."*
- [ ] GitHub: https://github.com/web3guru888/simoproof
- [ ] Demo video URL
- [ ] Live demo: https://simoproof.org
- [ ] Contract addresses: DiscoveryVerifier `0x5508C6...` + EAS Schema `0x86704a...`
- [ ] Select 3 tracks: ENS + KeeperHub + Gensyn

---

## 13. Verifiable References

| Resource | URL | Status |
|----------|-----|--------|
| ETHGlobal Open Agents | https://ethglobal.com/events/openagents | ✅ Live |
| ENS Prize Track | https://ethglobal.com/events/openagents/prizes | ✅ Live |
| KeeperHub Prize | https://keeperhub.com/blog/008-first-hackathon-openagents | ✅ Live |
| Gensyn AXL Docs | https://docs.gensyn.ai/tech/agent-exchange-layer | ✅ Live |
| ENSIP-25 | https://docs.ens.domains/building-with-ai/ | ✅ Live |
| EAS (Base Sepolia) | https://base-sepolia.easscan.org | ✅ Live |
| RISC Zero | https://dev.risczero.com | ✅ Live |
| 0G Storage | https://docs.0g.ai | ✅ Live |
| ASI:One API | https://api.asi1.ai/v1 | ✅ Live |
| KeeperHub API | https://app.keeperhub.com | ✅ Live |
| EAS SDK | https://docs.attest.org/ | ✅ Live |
| ENS SDK (viem) | https://docs.ens.domains/ | ✅ Live |

---

*SPEC end. See PRD for product strategy, prize targeting rationale, and demo scenario narrative.*
