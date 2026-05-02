# AI Tool Attribution

This document discloses the use of AI tools during the development of SimoProof, as required by the [ETHGlobal Open Agents 2026 rules](https://ethglobal.com/events/openagents/info/details).

---

## Tools Used

| Tool | Role |
|------|------|
| **Claude (Anthropic)** | Primary development assistant — architecture design, code generation, debugging, documentation |
| **ASI:One (Fetch.ai)** | Runtime LLM for Simocracy senate deliberation votes (integrated as the inference backend via OpenAI-compatible API) |

---

## What AI Did

### Claude — Taurus Agent Platform

All code in this repository was developed with Claude acting as a coding assistant inside the [Taurus multi-agent orchestration platform](https://taurus.ai). The human contributor directed the entire project:

- **Concept & vision** — the SimoProof idea, architecture, and prize track strategy were defined by the human contributor
- **Verification research** — all claims in the source documents were manually reviewed before building
- **Architecture decisions** — the 7-step pipeline (AXL → Simocracy → ZK → 0G → EAS → ENS), prize track targeting, and module boundaries were designed by the human
- **Specification** — the human approved every section of `docs/PRD.md` and `docs/SPEC.md` before code was written
- **Integration choices** — ASI:One as the LLM backend, KeeperHub MCP patterns, ENSIP-25 text records — all human decisions
- **Review & testing** — the human ran all tests, verified outputs, and directed fixes

Claude generated code, wrote documentation, ran shell commands, and iterated on implementations based on human feedback.

### What Claude Did NOT Do

- Claude did not decide what to build
- Claude did not choose which prize tracks to target
- Claude did not design the Simocracy senate concept or the Rodin-inspired 12-phase architecture
- Claude did not write the project narrative or the hackathon submission description

---

## Spec-Driven Workflow

This project followed a spec-driven development process as permitted by ETHGlobal rules:

1. **Research phase** — Claims in the source documents were verified against primary sources (ENS EIPs, Gensyn AXL docs, KeeperHub API, etc.)
2. **PRD** — `docs/PRD.md` defines goals, user stories, and success criteria
3. **SPEC** — `docs/SPEC.md` defines the technical architecture, module interfaces, and data flows
4. **Implementation** — Code was generated to satisfy the SPEC, not the other way around
5. **Testing** — 8/8 Foundry contract tests, full pipeline smoke test (`scripts/demo.ts`)

All planning artifacts are included in the `docs/` directory.

---

## Human Contribution Summary

The human contributor is the sole team member. Their contributions include:

- Original concept: applying Simocracy/senate-style multi-agent consensus to scientific discovery verification
- Prize track strategy: targeting 0G + Gensyn + ENS + KeeperHub simultaneously as a unified pipeline
- Domain expertise: Web3 identity (ENS/ENSIP-25), ZK proofs (RISC Zero), agent frameworks
- Directing AI: writing prompts, reviewing outputs, testing locally, making go/no-go decisions at each step
- Real credentials: ASI:One API key (Fetch.ai Innovation Lab), GitHub account, ETH wallet

---

## Runtime AI (ASI:One)

The Simocracy senate (see `packages/simocracy/`) uses **ASI:One** as its inference backend at runtime:

- **Endpoint:** `https://api.asi1.ai/v1` (OpenAI-compatible)
- **Model:** `asi1`
- **Role:** Each of the 4 senator agents (Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor) calls the ASI:One API to generate a deliberation vote on submitted discoveries
- **Config:** `LLM_BASE_URL` and `LLM_MODEL` in `.env`

This is a deliberate architectural choice: ASI:One is Fetch.ai's Web3-native LLM, making it thematically consistent with a decentralised science verification network.
