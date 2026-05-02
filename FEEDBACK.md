# SimoProof — KeeperHub Feedback
**Hackathon:** ETHGlobal Open Agents 2026  
**Integration type:** MCP server + workflow automation  
**Integration time:** Setup ~1h | First working call ~2h | Full integration ~6h

---

## What We Built

SimoProof uses KeeperHub as the backbone automation layer for a 7-stage verified discovery pipeline. Every step from claim ingestion to on-chain EAS attestation is orchestrated by KeeperHub workflows, enabling hands-off operation with retry logic and full audit trails.

### Workflow Architecture
We created 5 interconnected KeeperHub workflows:
1. **Poll Discoveries** (`simoproof-poll-discoveries`) — 30s interval trigger, picks up pending discoveries from mock-discovery module
2. **Validate via Simocracy** (`simoproof-validate`) — Event-triggered on `discovery.pending`, runs 4-Sim AI Senate (Bayesian Reasoner, Domain Skeptic, Causal Analyst, Replication Auditor) via ASI:One LLM
3. **Generate ZK Proof** (`simoproof-prove`) — Event-triggered on `discovery.validated`, calls RISC Zero prover
4. **Submit On-chain** (`simoproof-attest`) — Event-triggered on `discovery.proved`, calls `DiscoveryVerifier.submitDiscovery()` → EAS on Base Sepolia
5. **Update ENS** (`simoproof-ens-update`) — Event-triggered on `discovery.attested`, updates ENSIP-25 text records on `node-1.simoproof.eth`

### Integration Stats
- Workflows created: 5
- Tools exposed via MCP: 6 (`poll_pending_discoveries`, `run_simocracy_validation`, `generate_zk_proof`, `submit_onchain_attestation`, `update_ens_records`, `verify_claim`)
- Retry configurations: 3 unique backoff profiles
- Total automated pipeline steps per discovery: 5 (validate → prove → attest → store → ens)
- Discoveries processed: 5 (all confirmed on-chain)

---

## What Worked Well

**Event-driven workflow chaining** is exactly the right model for a multi-step async pipeline. The combination of interval triggers (for polling) + event triggers (for pipeline stages) covered all our use cases cleanly. We didn't need a separate orchestrator — KeeperHub *is* the orchestrator.

**Retry logic with exponential backoff** was critical for the ZK proof step (RISC Zero can be slow or time out in real mode). We configured 3 retries with `[60, 180, 600]s` backoff for the proof job and never had to manually re-trigger anything.

**MCP integration** was a natural fit — we expose 6 MCP tools from `packages/keeperhub/` and KeeperHub calls them. The MCP protocol is well-suited to KeeperHub's action model. Any MCP-capable agent can now hook into the SimoProof pipeline without touching our codebase directly.

**Workflow graph visualization** in the KeeperHub dashboard helped us debug step sequencing during development. Seeing the workflow as a graph (nodes/edges) made it obvious when we'd wired a trigger wrong.

**API consistency** — the `execute` endpoint, once we got the payload shape right (nodes + edges + the correct `base_url`), was reliable throughout the hackathon. No mysterious 500s.

---

## Friction Points & Bugs

### 1. Base URL vs. API base URL confusion ⚠️
The KeeperHub API base URL is `https://app.keeperhub.com` — **not** `https://app.keeperhub.com/api`. The docs show examples hitting `/api/...` paths, which led us to set `KEEPERHUB_BASE_URL=https://app.keeperhub.com/api` in our `.env`. This caused 404s on every call until we found the correct base URL. 

**Suggestion:** Make the base URL explicit in every code example in the docs, or provide a simple health-check endpoint that works at both paths and redirects.

### 2. Workflow payload format is underdocumented ⚠️
Creating a workflow requires a `nodes` + `edges` graph payload. The field names and expected shapes aren't fully documented — we had to infer the correct structure by inspecting example payloads in the dashboard UI's network tab. A structured JSON Schema for the workflow creation body would have saved ~2 hours.

### 3. No local dev mode ⚠️
Development requires hitting the live KeeperHub API — there's no local emulator. This meant every iteration required a live internet connection and burned real API calls. A `keeperhub dev` CLI command (similar to `anvil` for Ethereum or `stripe listen` for webhooks) would dramatically speed up development.

### 4. No WebSocket event stream
KeeperHub doesn't push execution events to client code — we had to poll the event queue via HTTP. For a pipeline where steps take 30-90 seconds each, polling every 5 seconds feels wasteful. A WebSocket stream for workflow execution events (similar to how the KeeperHub dashboard itself gets real-time updates) would simplify the pipeline orchestrator significantly.

### 5. Workflow versioning without migration
When we updated a workflow definition during development (e.g., changing a step's retry config), KeeperHub created a new version but didn't migrate in-progress executions. An explicit `migrateExistingExecutions: true` option when updating a workflow would help.

---

## Feature Requests

1. **`keeperhub dev` CLI** — local workflow engine with no API key, similar to `anvil` for Ethereum. This is the single highest-impact DX improvement.

2. **Webhook-to-event bridging** — native support for "when 0G storage upload webhook fires, emit `storage.uploaded` event". Currently we wrap everything in a custom HTTP endpoint, which adds boilerplate.

3. **First-class ZK proof action type** — `{ action: "zkproof", prover: "risc0", guest_image: "...", input: "..." }`. The current pattern of calling a subprocess from an MCP tool works but a native action type would be more robust and enable KeeperHub to show proof status natively in the dashboard.

4. **JSON Schema for workflow payloads** — publish a machine-readable schema for the workflow creation API so tools can autocomplete and validate workflow definitions.

5. **ENS action type** — `{ action: "ens_text_set", name: "node-1.simoproof.eth", key: "discoveries_count", value: "10" }`. ENS updates are a common pattern for agent state tracking; a native action would handle the resolver lookup and gas estimation automatically.

---

## Documentation Gaps

- The `KEEPERHUB_BASE_URL` value that actually works is not stated anywhere we could find
- The workflow `nodes/edges` payload structure needs a dedicated doc page with at least 3 annotated examples
- No example of a multi-step chained workflow in the quickstart guide
- The MCP server `stdio` transport mode is documented but the HTTP transport path (for server-side integrations) is not

---

## Team
SimoProof — ETHGlobal Open Agents 2026  
GitHub: https://github.com/web3guru888/simoproof  
Demo: https://simoproof.org
