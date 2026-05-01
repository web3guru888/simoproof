# SimoProof — KeeperHub Feedback

## Integration Summary

SimoProof uses KeeperHub as the backbone automation layer for a 5-stage verified discovery pipeline. Every step from claim ingestion to on-chain EAS attestation is driven by a KeeperHub workflow, enabling hands-off operation with robust retry logic.

## What We Built

### Workflow Architecture
We created 5 interconnected KeeperHub workflows:
1. **Poll Discoveries** (`simoproof-poll-discoveries`) — 30s interval trigger, picks up pending discoveries from mock-discovery module
2. **Validate via Simocracy** (`simoproof-validate`) — Event-triggered on `discovery.pending`, runs 4-Sim AI Senate
3. **Generate ZK Proof** (`simoproof-prove`) — Event-triggered on `discovery.validated`, calls Risc0 Bonsai prover
4. **Submit On-chain** (`simoproof-attest`) — Event-triggered on `discovery.proved`, calls `DiscoveryVerifier.submitDiscovery()` → EAS
5. **Update ENS** (`simoproof-ens-update`) — Event-triggered on `discovery.attested`, updates ENSIP-25 text records

### What We Liked
- **Event-driven workflow chaining** is exactly the right model for a multi-step async pipeline. The combination of interval triggers (for polling) + event triggers (for pipeline stages) covered all our use cases cleanly.
- **Retry logic with exponential backoff** was critical for the ZK proof step (Bonsai can be slow or time out). We configured 3 retries with [60, 180, 600]s backoff for the proof job.
- **WorkflowBuilder API** in `keeperhub-sdk` made workflow creation expressive and type-safe. We especially liked the `WorkflowPipeline` pattern for chaining steps.
- **MCP integration** was a natural fit — we expose 6 MCP tools and connect KeeperHub to the server. This means any MCP-capable agent can trigger or inspect the pipeline.

### What Could Be Improved
- **No direct WebSocket event push from KeeperHub to client code** — we had to poll the KeeperHub event queue via HTTP instead of receiving push notifications. A WebSocket stream for workflow execution events would simplify the pipeline orchestrator significantly.
- **Workflow versioning** — when we updated a workflow definition during development, KeeperHub created a new version but didn't automatically migrate running executions. An explicit `migrateExistingExecutions` option would be helpful.
- **Local dev mode without API key** — development would be faster with a local KeeperHub emulator (similar to how the AXL package provides `startLocalAxlNetwork`). Having to hit the real KeeperHub API during development slowed iteration.
- **Structured event payloads** — the event payload is freeform JSON, which works but could benefit from a schema registry so workflows can declare their expected event shape and KeeperHub can validate at registration time.

### Suggestions
1. Add a `keeperhub dev` CLI command that starts a local workflow engine with no API key needed, similar to `anvil` for Ethereum
2. Support webhook-to-event bridging natively (e.g., "when 0G storage upload completes, emit `storage.uploaded`")
3. Consider native Risc0 action type for ZK-intensive workflows — the current pattern of calling a subprocess from an MCP tool works but a first-class zkproof action would be more robust

## Integration Stats
- Workflows created: 5
- Tools exposed via MCP: 6 (`poll_pending_discoveries`, `run_simocracy_validation`, `generate_zk_proof`, `submit_onchain_attestation`, `update_ens_records`, `verify_claim`)
- Retry configurations: 3 unique backoff profiles
- Total automated pipeline steps per discovery: 5 (validate → prove → attest → store → ens)

## Team
SimoProof team — ETHGlobal Open Agents 2026
