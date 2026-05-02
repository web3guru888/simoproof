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
- **Verification research** — claims in the source documents were reviewed before building; a full 35-hypothesis verification pipeline was run (see `/shared/kb/simoproof-verify-reports/`)
- **Architecture decisions** — the 7-step pipeline (AXL → Simocracy → ZK → 0G → EAS → ENS), prize track targeting, and module boundaries were designed by the human
- **Specification** — the human approved every section of `docs/PRD.md` and `docs/SPEC.md` before code was written
- **Integration choices** — ASI:One as the LLM backend, KeeperHub MCP patterns, ENSIP-25 text records — all human decisions
- **Review & testing** — the human ran all tests, verified outputs, and directed fixes

Claude generated code, wrote documentation, ran shell commands, and iterated on implementations based on human feedback.

### What Claude Did NOT Do

- Claude did not decide what to build
- Claude did not choose which prize tracks to target
- Claude did not design the Simocracy senate concept or the 12-phase architecture
- Claude did not write the project narrative or the hackathon submission description
- Claude did not choose to use ASI:One (that was the human's deliberate choice)

---

## Spec-Driven Workflow

This project followed a spec-driven development process as permitted by ETHGlobal rules:

1. **Research phase** — Claims in the source documents were verified against primary sources (ENS EIPs, Gensyn AXL docs, KeeperHub API, RISC Zero docs, EAS docs)
2. **PRD** — `docs/PRD.md` defines goals, user stories, and success criteria
3. **SPEC** — `docs/SPEC.md` defines the technical architecture, module interfaces, and data flows
4. **Implementation** — Code was generated to satisfy the SPEC, not the other way around
5. **Testing** — 8/8 Foundry contract tests pass; full pipeline smoke test (`scripts/demo.ts`) processes 5/5 discoveries end-to-end

All planning artifacts are included in the `docs/` directory.

---

## Build Stats

| Metric | Value |
|--------|-------|
| Foundry contract tests | 8/8 passing |
| Full pipeline run | 5/5 discoveries completed |
| EAS attestations confirmed | 5 live on Base Sepolia |
| ENS text records updated | `discoveries_count=10`, `latest_eas_uid` set |
| KeeperHub workflows | 5 active |
| Live demo site | https://simoproof.org |
| GitHub repo | https://github.com/web3guru888/simoproof |
| Git commits | 12 (Apr 30 – May 2) |

---

## Human Contribution Summary

The human contributor is the sole team member. Their contributions include:

- Original concept: applying Simocracy/senate-style multi-agent consensus to scientific discovery verification
- Prize track strategy: targeting Gensyn + ENS + KeeperHub simultaneously as a unified pipeline
- Domain expertise: Web3 identity (ENS/ENSIP-25), ZK proofs (RISC Zero), agent frameworks, EAS
- Directing AI: writing prompts, reviewing outputs, testing locally, making go/no-go decisions at each step
- Real credentials: ASI:One API key (Fetch.ai), KeeperHub API key, GitHub account, funded ETH wallet
- Design decisions: "Scientific Tribunal" aesthetic for simoproof.org, senate senator personas, 12-phase Rodin architecture framing

---

## Runtime AI (ASI:One)

The Simocracy senate (see `packages/simocracy/`) uses **ASI:One** as its inference backend at runtime:

- **Endpoint:** `https://api.asi1.ai/v1` (OpenAI-compatible)
- **Model:** `asi1`
- **Role:** Each of the 4 senator agents (Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor) calls the ASI:One API to generate a deliberation vote on submitted discoveries
- **Threshold:** 2/4 endorsements required for a discovery to pass senate
- **Config:** `LLM_BASE_URL` and `LLM_MODEL` in `.env`

This is a deliberate architectural choice: ASI:One is Fetch.ai's Web3-native LLM, making it thematically consistent with a decentralised science verification network built on open infrastructure.

### Senate Senator Constitutions
Each senator has a unique deliberation SKILL.md defining their reasoning approach:
- `sims/bayesian-reasoner/SKILL.md` — probabilistic reasoning, prior update
- `sims/causal-analyst/SKILL.md` — causal chain verification
- `sims/domain-skeptic/SKILL.md` — adversarial challenge, null hypothesis defense
- `sims/replication-auditor/SKILL.md` — methodology and replication standard checks
