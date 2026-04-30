# SimoProof — Technical Specification
**Version:** 1.0  
**Date:** 2026-04-30  
**Target Event:** ETHGlobal Open Agents (April 24 – May 6, 2026)  
**Selected Prize Tracks:** ENS (4a) + KeeperHub (5a + 5b) + Gensyn AXL (3a)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SimoProof Network                             │
│                                                                      │
│   ┌──────────────────┐  AXL P2P (encrypted)  ┌──────────────────┐  │
│   │  Agent: Alice    │◄─────────────────────►│  Agent: Bob      │  │
│   │  alice.agents.eth│                        │  bob.agents.eth  │  │
│   │  AXL Node 1      │                        │  AXL Node 2      │  │
│   │  :9002           │                        │  :9003           │  │
│   └────────┬─────────┘                        └────────┬─────────┘  │
│            │          AXL P2P (encrypted)              │             │
│            └──────────────────┬───────────────────────┘             │
│                               │                                      │
│                      ┌────────▼─────────┐                           │
│                      │  Agent: Carol    │                           │
│                      │ carol.agents.eth │                           │
│                      │  AXL Node 3      │                           │
│                      │  :9004           │                           │
│                      └────────┬─────────┘                           │
└───────────────────────────────│─────────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     KeeperHub MCP      │
                    │  (execution layer)     │
                    │  keeperhub.com         │
                    └───────────┬────────────┘
                                │
          ┌─────────────────────▼──────────────────────┐
          │           Ethereum Sepolia                   │
          │                                             │
          │  ┌─────────────┐  ┌──────────────────────┐ │
          │  │ ENS Subname │  │ EAS Schema Registry  │ │
          │  │ Registrar   │  │ (SimoProof schema)   │ │
          │  │*.agents.eth │  │                      │ │
          │  └─────────────┘  └──────────────────────┘ │
          │  ┌─────────────────────────────────────────┐│
          │  │ ERC-8004 Agent Registry (Reference)     ││
          │  └─────────────────────────────────────────┘│
          └─────────────────────────────────────────────┘
```

### Component Summary

| Component | Tech | Purpose |
|-----------|------|---------|
| `axl-node` | Go 1.25.x binary | Encrypted P2P communication between agents |
| `agent-runtime` | TypeScript/Node.js | Core agent logic, AXL + KeeperHub + ENS orchestration |
| `contracts` | Solidity 0.8.x | ENS subname registrar + EAS schema definition |
| `frontend` | Next.js 14 + Tailwind | Demo visualization UI |
| ENS | Sepolia ENS | Agent identity, metadata storage, discovery |
| KeeperHub | External service | Reliable onchain execution (MCP server) |
| EAS | Sepolia EAS | Behavioral attestations per agent ENS name |

---

## 2. Repository Structure

```
simoproof/
├── packages/
│   ├── axl-bridge/         # Go AXL node wrapper + HTTP bridge
│   │   ├── cmd/node/       # AXL node entrypoint
│   │   ├── node-config.alice.json
│   │   ├── node-config.bob.json
│   │   ├── node-config.carol.json
│   │   └── README.md
│   │
│   ├── agent-runtime/      # TypeScript agent SDK
│   │   ├── src/
│   │   │   ├── identity/   # ENS resolution, ENSIP-25 text records
│   │   │   ├── comms/      # AXL client (HTTP to localhost:9002)
│   │   │   ├── execution/  # KeeperHub MCP integration
│   │   │   ├── reputation/ # EAS read/write
│   │   │   └── agent.ts    # SimoProofAgent class
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── contracts/          # Solidity smart contracts
│   │   ├── src/
│   │   │   ├── AgentsSubnameRegistrar.sol
│   │   │   └── SimoProofEASSchema.sol
│   │   ├── script/         # Deployment scripts (Foundry)
│   │   ├── test/
│   │   └── foundry.toml
│   │
│   └── frontend/           # Next.js demo app
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   │   ├── AgentCard.tsx
│       │   │   ├── AXLMessageLog.tsx
│       │   │   ├── KeeperHubStatus.tsx
│       │   │   └── EASReputation.tsx
│       │   └── hooks/
│       ├── package.json
│       └── README.md
│
├── FEEDBACK.md             # ← CRITICAL: KeeperHub feedback bounty (repo root)
├── README.md               # Project overview + setup
├── docker-compose.yml      # Spins up all 3 AXL nodes + demo agents
└── package.json            # Monorepo root (pnpm workspaces)
```

> ⚠️ **FEEDBACK.md must be at repo root** — required for KeeperHub feedback bounty eligibility. Omitting this is disqualifying.

---

## 3. Smart Contracts

### 3.1 AgentsSubnameRegistrar.sol

**Network:** Ethereum Sepolia  
**Purpose:** Allow anyone to register `<name>.agents.eth` as their agent's ENS identity.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/PublicResolver.sol";

/**
 * @title AgentsSubnameRegistrar
 * @notice Registers <label>.agents.eth subnames for SimoProof agents.
 *         Stores ENSIP-25 text records at registration time.
 * @dev Deployed at [ADDRESS] on Sepolia. Parent name: agents.eth
 */
contract AgentsSubnameRegistrar {
    ENS public immutable ens;
    PublicResolver public immutable resolver;
    bytes32 public immutable parentNode; // namehash("agents.eth")

    // Track registrations
    mapping(bytes32 => address) public nodeToOwner;
    mapping(address => bytes32) public ownerToNode;

    event AgentRegistered(
        bytes32 indexed node,
        string label,
        address indexed owner,
        string capabilities,
        string axlPubkey
    );

    constructor(address _ens, address _resolver, bytes32 _parentNode) {
        ens = ENS(_ens);
        resolver = PublicResolver(_resolver);
        parentNode = _parentNode;
    }

    /**
     * @notice Register a new agent subname with ENSIP-25 metadata
     * @param label       The subdomain label (e.g., "alice" for alice.agents.eth)
     * @param capabilities JSON string of agent capabilities (e.g., '["research","execute"]')
     * @param axlPubkey   64-char hex ed25519 public key for AXL communication
     * @param registryId  ERC-8004 agent registry ID (or "" if not yet registered)
     */
    function registerAgent(
        string calldata label,
        string calldata capabilities,
        string calldata axlPubkey,
        string calldata registryId
    ) external {
        bytes32 labelHash = keccak256(bytes(label));
        bytes32 node = keccak256(abi.encodePacked(parentNode, labelHash));

        require(nodeToOwner[node] == address(0), "Already registered");

        // Register in ENS
        ens.setSubnodeRecord(
            parentNode,
            labelHash,
            msg.sender,
            address(resolver),
            0 // TTL
        );

        // Set address record
        resolver.setAddr(node, msg.sender);

        // Set ENSIP-25 text records
        resolver.setText(node, "capabilities", capabilities);
        resolver.setText(node, "axl-pubkey", axlPubkey);

        if (bytes(registryId).length > 0) {
            // ENSIP-25 format: agent-registration[erc8004][<id>] = "1"
            string memory ensip25Key = string.concat(
                "agent-registration[erc8004][", registryId, "]"
            );
            resolver.setText(node, ensip25Key, "1");
        }

        // Store network text record: "network" = "simoproof"
        resolver.setText(node, "network", "simoproof");

        nodeToOwner[node] = msg.sender;
        ownerToNode[msg.sender] = node;

        emit AgentRegistered(node, label, msg.sender, capabilities, axlPubkey);
    }

    /**
     * @notice Update AXL pubkey (e.g., on key rotation)
     */
    function updateAxlPubkey(bytes32 node, string calldata axlPubkey) external {
        require(nodeToOwner[node] == msg.sender, "Not owner");
        resolver.setText(node, "axl-pubkey", axlPubkey);
    }

    /**
     * @notice Resolve agent by label — returns address + metadata
     */
    function resolveAgent(string calldata label) external view
        returns (address owner, string memory capabilities, string memory axlPubkey)
    {
        bytes32 node = keccak256(abi.encodePacked(
            parentNode,
            keccak256(bytes(label))
        ));
        owner = nodeToOwner[node];
        capabilities = resolver.text(node, "capabilities");
        axlPubkey = resolver.text(node, "axl-pubkey");
    }
}
```

**Deployment:**
```bash
# Foundry deploy to Sepolia
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

**ENS setup prerequisite:**
```bash
# Register agents.eth on Sepolia ENS, set registrar as controller
# Then run contract deployment
```

---

### 3.2 EAS Schema (No Contract Needed — Schema Registration)

**Schema registered via EAS SchemaRegistry on Sepolia**  
**EAS Sepolia:** `0xC2679fBD37d54388Ce493F1DB75320D236e1815e`

```
Schema string:
"string agentENS, string taskType, bool outcome, string details, string verifierENS, uint256 timestamp"
```

**Registration script (TypeScript):**
```typescript
import { EAS, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";

const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
schemaRegistry.connect(signer);

const schema = "string agentENS,string taskType,bool outcome,string details,string verifierENS,uint256 timestamp";
const resolverAddress = "0x0000000000000000000000000000000000000000"; // no resolver
const revocable = true;

const tx = await schemaRegistry.register({ schema, resolverAddress, revocable });
await tx.wait();
// Save returned schemaUID
```

**Store schemaUID in ENS text record:**
```typescript
resolver.setText(carolNode, "eas-schema", SIMOPROOF_SCHEMA_UID);
```

---

## 4. Gensyn AXL Integration

### 4.1 AXL Node Setup

```bash
# Required: Go 1.25.x
go version  # must be 1.25.x

# Clone and build
git clone https://github.com/gensyn-ai/axl.git
cd axl
go build -o node ./cmd/node/

# Generate ed25519 keypairs for each agent
openssl genpkey -algorithm ed25519 -out alice-private.pem
openssl pkey -in alice-private.pem -pubout -out alice-public.pem

openssl genpkey -algorithm ed25519 -out bob-private.pem
openssl pkey -in bob-private.pem -pubout -out bob-public.pem

openssl genpkey -algorithm ed25519 -out carol-private.pem
openssl pkey -in carol-private.pem -pubout -out carol-public.pem
```

### 4.2 Node Configuration

Three separate configs — each on a different port, each with its own identity:

**`node-config.alice.json`:**
```json
{
  "node": {
    "privateKeyFile": "alice-private.pem",
    "listenAddr": "127.0.0.1:9002",
    "peers": ["127.0.0.1:9003", "127.0.0.1:9004"]
  },
  "api": {
    "listenAddr": "127.0.0.1:9002"
  }
}
```

**`node-config.bob.json`:** (port 9003)  
**`node-config.carol.json`:** (port 9004)

**Start all 3 nodes (Docker Compose):**
```yaml
# docker-compose.yml
version: "3.9"
services:
  axl-alice:
    build: ./packages/axl-bridge
    command: ./node -config node-config.alice.json
    ports: ["9002:9002"]
    volumes: ["./keys:/keys"]

  axl-bob:
    build: ./packages/axl-bridge
    command: ./node -config node-config.bob.json
    ports: ["9003:9003"]
    volumes: ["./keys:/keys"]

  axl-carol:
    build: ./packages/axl-bridge
    command: ./node -config node-config.carol.json
    ports: ["9004:9004"]
    volumes: ["./keys:/keys"]
```

> ✅ **Gensyn hard requirement satisfied:** 3 separate AXL nodes, separate ports, separate ed25519 identities.

### 4.3 AXL Client (TypeScript)

```typescript
// packages/agent-runtime/src/comms/axl-client.ts

export interface AXLMessage {
  type: "TaskRequest" | "TaskResult" | "VerificationRequest" | "AttestationProposal";
  from: string;      // sender ENS name
  to: string;        // recipient ENS name  
  payload: unknown;
  timestamp: number;
}

export class AXLClient {
  private nodeUrl: string;  // e.g., "http://localhost:9002"
  private agentPubkey: string;

  constructor(nodePort: number, pubkey: string) {
    this.nodeUrl = `http://localhost:${nodePort}`;
    this.agentPubkey = pubkey;
  }

  /**
   * Send a message to another agent via AXL
   * Recipient identified by their AXL pubkey (retrieved from ENS)
   */
  async send(recipientPubkey: string, message: AXLMessage): Promise<void> {
    const response = await fetch(`${this.nodeUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipientPubkey,
        payload: JSON.stringify(message),
      }),
    });
    if (!response.ok) throw new Error(`AXL send failed: ${response.statusText}`);
  }

  /**
   * Poll for incoming messages
   */
  async receive(): Promise<AXLMessage[]> {
    const response = await fetch(`${this.nodeUrl}/receive`);
    const data = await response.json();
    return data.messages?.map((m: { payload: string }) =>
      JSON.parse(m.payload)
    ) ?? [];
  }

  /**
   * Get this node's peer ID (for display/verification)
   */
  async getPeerID(): Promise<string> {
    const response = await fetch(`${this.nodeUrl}/id`);
    const data = await response.json();
    return data.id;
  }
}
```

### 4.4 AXL-ENS Discovery Bridge

The key innovation: **AXL pubkeys stored in ENS text records enable ENS-based AXL discovery.**

```typescript
// packages/agent-runtime/src/identity/ens-client.ts

import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

export class ENSClient {
  private client = createPublicClient({ chain: sepolia, transport: http() });

  /**
   * Resolve agent identity from ENS name
   */
  async resolveAgent(ensName: string): Promise<{
    address: string;
    capabilities: string[];
    axlPubkey: string;
    easSchema: string;
  }> {
    const name = normalize(ensName);

    const [address, capabilities, axlPubkey, easSchema] = await Promise.all([
      this.client.getEnsAddress({ name }),
      this.client.getEnsText({ name, key: "capabilities" }),
      this.client.getEnsText({ name, key: "axl-pubkey" }),
      this.client.getEnsText({ name, key: "eas-schema" }),
    ]);

    if (!address) throw new Error(`ENS name not found: ${ensName}`);
    if (!axlPubkey) throw new Error(`No AXL pubkey for: ${ensName}`);

    return {
      address,
      capabilities: JSON.parse(capabilities ?? "[]"),
      axlPubkey,
      easSchema: easSchema ?? "",
    };
  }

  /**
   * Enumerate all .agents.eth subnames (via subgraph or registrar events)
   */
  async listAllAgents(): Promise<string[]> {
    // Query AgentRegistered events from registrar contract
    const logs = await this.client.getLogs({
      address: REGISTRAR_ADDRESS,
      event: parseAbiItem("event AgentRegistered(bytes32 indexed node, string label, address indexed owner, string capabilities, string axlPubkey)"),
      fromBlock: DEPLOY_BLOCK,
    });
    return logs.map(log => `${log.args.label}.agents.eth`);
  }
}
```

---

## 5. KeeperHub Integration

### 5.1 MCP Server Setup

```typescript
// packages/agent-runtime/src/execution/keeperhub-client.ts

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class KeeperHubClient {
  private mcpClient: Client;

  async connect() {
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@keeperhub/mcp-server"],
      env: { KEEPERHUB_API_KEY: process.env.KEEPERHUB_API_KEY! }
    });

    this.mcpClient = new Client({ name: "simoproof-agent", version: "1.0.0" });
    await this.mcpClient.connect(transport);
  }

  /**
   * Submit an EAS attestation via KeeperHub (with retry)
   */
  async submitAttestation(params: {
    schemaUID: string;
    recipient: string;
    data: Record<string, unknown>;
    agentENS: string;
  }): Promise<string> {
    const result = await this.mcpClient.callTool({
      name: "execute_transaction",
      arguments: {
        contract: EAS_SEPOLIA_ADDRESS,
        abi: EAS_ABI,
        method: "attest",
        args: [{
          schema: params.schemaUID,
          data: {
            recipient: params.recipient,
            expirationTime: 0n,
            revocable: true,
            data: encodeEASData(params.data),
          }
        }],
        metadata: {
          purpose: "simoproof-attestation",
          agentENS: params.agentENS,
        }
      }
    });

    return result.content[0].text; // transaction hash
  }

  /**
   * Update ENS text record via KeeperHub (with retry)
   */
  async updateENSTextRecord(params: {
    node: string;
    key: string;
    value: string;
  }): Promise<string> {
    const result = await this.mcpClient.callTool({
      name: "execute_transaction",
      arguments: {
        contract: ENS_PUBLIC_RESOLVER_SEPOLIA,
        abi: ENS_RESOLVER_ABI,
        method: "setText",
        args: [params.node, params.key, params.value],
      }
    });
    return result.content[0].text;
  }

  /**
   * Get execution history for an agent (audit trail)
   */
  async getExecutionHistory(agentENS: string): Promise<ExecutionRecord[]> {
    const result = await this.mcpClient.callTool({
      name: "get_execution_history",
      arguments: { tag: agentENS }
    });
    return JSON.parse(result.content[0].text);
  }
}
```

### 5.2 x402 Payment Rail (KeeperHub Integration — bonus)

```typescript
// Optional: agents pay for KeeperHub execution via x402
// Demonstrates KeeperHub's payment integration capability

async function payForExecution(amount: bigint, agentWallet: WalletClient) {
  // x402 payment header in HTTP request to KeeperHub
  // Enables autonomous agent-to-service micropayments
}
```

---

## 6. EAS Reputation Layer

### 6.1 Attestation Creation (by Carol)

```typescript
// packages/agent-runtime/src/reputation/eas-client.ts

import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

export class EASClient {
  private eas: EAS;

  constructor(signer: ethers.Signer) {
    this.eas = new EAS(EAS_SEPOLIA_ADDRESS);
    this.eas.connect(signer);
  }

  async createAttestation(params: {
    agentENS: string;
    taskType: string;
    outcome: boolean;
    details: string;
    verifierENS: string;
  }): Promise<string> {
    const schemaEncoder = new SchemaEncoder(
      "string agentENS,string taskType,bool outcome,string details,string verifierENS,uint256 timestamp"
    );

    const encodedData = schemaEncoder.encodeData([
      { name: "agentENS",     type: "string",  value: params.agentENS },
      { name: "taskType",     type: "string",  value: params.taskType },
      { name: "outcome",      type: "bool",    value: params.outcome },
      { name: "details",      type: "string",  value: params.details },
      { name: "verifierENS",  type: "string",  value: params.verifierENS },
      { name: "timestamp",    type: "uint256", value: BigInt(Date.now()) },
    ]);

    // Submit via KeeperHub for reliable execution
    const txHash = await this.keeperHub.submitAttestation({
      schemaUID: SIMOPROOF_SCHEMA_UID,
      recipient: await this.resolveAddress(params.agentENS),
      data: { encodedData },
      agentENS: params.verifierENS,
    });

    return txHash;
  }

  /**
   * Get reputation score for an agent
   */
  async getReputation(ensName: string): Promise<{
    total: number;
    successful: number;
    score: number;
    recentAttestations: Attestation[];
  }> {
    const address = await this.resolveAddress(ensName);

    // Query EAS GraphQL (easscan.org/graphql on Sepolia)
    const attestations = await this.queryEAS(address);

    const successful = attestations.filter(a => a.outcome === true).length;
    const total = attestations.length;
    const score = total > 0 ? Math.round((successful / total) * 100) : 0;

    return { total, successful, score, recentAttestations: attestations.slice(0, 5) };
  }
}
```

---

## 7. SimoProofAgent Class (Core Runtime)

```typescript
// packages/agent-runtime/src/agent.ts

export class SimoProofAgent {
  private ensName: string;
  private ens: ENSClient;
  private axl: AXLClient;
  private keeper: KeeperHubClient;
  private eas: EASClient;

  constructor(config: {
    ensName: string;       // e.g., "alice.agents.eth"
    axlPort: number;       // e.g., 9002
    axlPubkey: string;     // ed25519 pubkey hex
    capabilities: string[]; // e.g., ["research", "coordinate"]
    wallet: ethers.Wallet;
  }) { /* ... */ }

  /**
   * Bootstrap agent — connect all layers
   */
  async initialize() {
    await this.keeper.connect();
    const agentId = await this.axl.getPeerID();
    console.log(`[${this.ensName}] AXL node live. Peer ID: ${agentId}`);
    console.log(`[${this.ensName}] KeeperHub connected.`);
    console.log(`[${this.ensName}] Identity: ${await this.ens.resolveAgent(this.ensName)}`);
  }

  /**
   * Discover another agent by ENS name and open AXL channel
   */
  async connectToAgent(targetENS: string) {
    const { axlPubkey, capabilities } = await this.ens.resolveAgent(targetENS);
    console.log(`[${this.ensName}] Resolved ${targetENS} → AXL: ${axlPubkey}`);
    console.log(`[${this.ensName}] Capabilities: ${capabilities}`);
    return { axlPubkey, capabilities };
  }

  /**
   * Send structured message via AXL
   */
  async sendMessage(targetENS: string, type: AXLMessage["type"], payload: unknown) {
    const { axlPubkey } = await this.connectToAgent(targetENS);
    await this.axl.send(axlPubkey, {
      type, from: this.ensName, to: targetENS, payload, timestamp: Date.now()
    });
    console.log(`[${this.ensName}] → ${targetENS}: ${type}`);
  }

  /**
   * Listen for incoming AXL messages
   */
  async listen(handler: (msg: AXLMessage) => Promise<void>) {
    setInterval(async () => {
      const messages = await this.axl.receive();
      for (const msg of messages) {
        console.log(`[${this.ensName}] ← ${msg.from}: ${msg.type}`);
        await handler(msg);
      }
    }, 1000); // poll every second
  }

  /**
   * Attest to another agent's task completion via EAS + KeeperHub
   */
  async attest(params: {
    agentENS: string;
    taskType: string;
    outcome: boolean;
    details: string;
  }): Promise<string> {
    console.log(`[${this.ensName}] Attesting ${params.agentENS}: ${params.outcome}`);
    return this.eas.createAttestation({ ...params, verifierENS: this.ensName });
  }
}
```

---

## 8. Frontend Demo App

### 8.1 Component Architecture

```
frontend/
├── src/app/
│   ├── page.tsx              # Main demo page
│   └── api/
│       ├── agents/route.ts   # Agent state API
│       ├── messages/route.ts # AXL message stream (SSE)
│       └── scenario/route.ts # Trigger demo scenario
│
└── src/components/
    ├── AgentCard.tsx          # Agent identity + reputation card
    ├── AXLMessageLog.tsx      # Live message flow visualization
    ├── KeeperHubStatus.tsx    # Transaction execution status
    ├── EASReputation.tsx      # Reputation score + attestation history
    └── DemoControls.tsx       # "Run Scenario" button + step indicator
```

### 8.2 AgentCard Component

```tsx
// Three panels, side-by-side

interface AgentData {
  ensName: string;          // "alice.agents.eth"
  address: string;          // 0x...
  capabilities: string[];   // ["research", "coordinate"]
  axlPeerId: string;        // AXL peer ID
  axlStatus: "idle" | "sending" | "receiving";
  reputation: {
    score: number;          // 0-100
    total: number;
    successful: number;
  };
}

export function AgentCard({ agent }: { agent: AgentData }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          🤖
        </div>
        <div>
          <h3 className="font-mono text-blue-400">{agent.ensName}</h3>
          <p className="text-xs text-gray-500">{agent.address.slice(0,6)}...{agent.address.slice(-4)}</p>
        </div>
        <div className={`ml-auto w-2 h-2 rounded-full ${
          agent.axlStatus === "idle" ? "bg-green-500" :
          agent.axlStatus === "sending" ? "bg-yellow-500 animate-pulse" :
          "bg-blue-500 animate-pulse"
        }`} />
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-4">
        {agent.capabilities.map(cap => (
          <span key={cap} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
            {cap}
          </span>
        ))}
      </div>

      {/* AXL Identity */}
      <div className="text-xs text-gray-500 font-mono mb-3">
        AXL: {agent.axlPeerId.slice(0, 16)}...
      </div>

      {/* Reputation */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Reputation</span>
          <span>{agent.reputation.score}% ({agent.reputation.successful}/{agent.reputation.total})</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${agent.reputation.score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### 8.3 Demo Scenario API

```typescript
// frontend/src/app/api/scenario/route.ts
// Triggers the full Alice → Bob → Carol pipeline

export async function POST(req: Request) {
  const { step } = await req.json();

  const alice = new SimoProofAgent({ ensName: "alice.agents.eth", axlPort: 9002, /* ... */ });
  const bob   = new SimoProofAgent({ ensName: "bob.agents.eth",   axlPort: 9003, /* ... */ });
  const carol = new SimoProofAgent({ ensName: "carol.agents.eth", axlPort: 9004, /* ... */ });

  // Step 1: Alice resolves Bob via ENS, opens AXL channel
  if (step === 1) {
    await alice.initialize();
    const bobInfo = await alice.connectToAgent("bob.agents.eth");
    return Response.json({ bobInfo, step: 1, status: "ENS resolved → AXL channel opened" });
  }

  // Step 2: Alice sends TaskRequest to Bob via AXL
  if (step === 2) {
    await alice.sendMessage("bob.agents.eth", "TaskRequest", {
      task: "execute-trade",
      condition: "gas < 15 gwei",
      amount: "0.01 ETH"
    });
    return Response.json({ step: 2, status: "TaskRequest sent via AXL" });
  }

  // ... steps 3-8 continue the scenario
}
```

---

## 9. Build Plan (14-Day Sprint)

| Day(s) | Task | Owner | Deliverable |
|--------|------|-------|-------------|
| **1** | Repo setup, ENS on Sepolia, Go env | Full team | Monorepo + ENS parent name registered |
| **2** | AXL binary built, 3 nodes running, Docker Compose | Backend | 3 AXL nodes communicating across separate processes |
| **3** | `AgentsSubnameRegistrar.sol` written + tested | Contracts | Passing Foundry tests |
| **4** | Deploy registrar to Sepolia, register Alice/Bob/Carol | Contracts | 3 agents registered on Sepolia ENS |
| **5** | `ENSClient` TypeScript — resolve agents, list agents | Backend | ENS resolution returning real data |
| **6** | `AXLClient` TypeScript — send/receive messages across nodes | Backend | Cross-node AXL messages working |
| **7** | `KeeperHubClient` — MCP server connect, submitAttestation | Backend | KeeperHub executing EAS submission |
| **8** | EAS schema deploy, `EASClient` attestation creation | Backend | Attestation appearing on easscan.org |
| **9** | `SimoProofAgent` class — full integration test | Backend | Alice → Bob → Carol pipeline end-to-end |
| **10** | Frontend scaffold, `AgentCard`, `AXLMessageLog` | Frontend | Three panels showing live data |
| **11** | `KeeperHubStatus`, `EASReputation` components | Frontend | Full demo UI functional |
| **12** | Demo scenario wiring — "Run Scenario" button | Frontend | One-click full pipeline demo |
| **13** | Architecture diagram, README, FEEDBACK.md | All | Submission docs complete |
| **14** | Demo video recording, final tests, submission | All | Submitted to ETHGlobal dashboard |

---

## 10. Environment Variables

```bash
# .env.example — DO NOT commit actual keys

# Ethereum
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<key>
PRIVATE_KEY_ALICE=0x...
PRIVATE_KEY_BOB=0x...
PRIVATE_KEY_CAROL=0x...

# KeeperHub
KEEPERHUB_API_KEY=<from app.keeperhub.com>

# Contract addresses (populated after deployment)
REGISTRAR_CONTRACT_ADDRESS=0x...
EAS_SCHEMA_UID=0x...
ENS_PARENT_NODE=0x...  # namehash("agents.eth")

# AXL
AXL_ALICE_PORT=9002
AXL_BOB_PORT=9003
AXL_CAROL_PORT=9004
```

---

## 11. Submission Checklist

**ETHGlobal Hacker Dashboard submission — verify all before submitting:**

### Hard Requirements (failure = disqualification)
- [ ] **FEEDBACK.md exists at repo root** (KeeperHub feedback bounty)
- [ ] AXL demo uses **separate nodes** — verify with `docker ps` showing 3 containers
- [ ] ENS demo has **no hard-coded values** — all resolution is live on Sepolia
- [ ] KeeperHub integration uses **MCP server** (not raw API bypass)
- [ ] Only **3 partner prizes selected**: ENS + KeeperHub + Gensyn AXL
- [ ] Demo video is **≤ 3 minutes**

### Required Submission Fields
- [ ] Project title: "SimoProof"
- [ ] Short description (≤ 280 chars): *"Verified agent identity network: ENS names for AI agents, AXL for encrypted P2P comms, KeeperHub for reliable onchain execution, EAS for on-chain reputation. Who is that agent? Now you can know."*
- [ ] GitHub repo URL (public)
- [ ] Demo video URL (Loom or YouTube, unlisted OK)
- [ ] Live demo URL (Vercel frontend + Sepolia contracts)
- [ ] Contract deployment addresses (registrar + EAS schema UID)
- [ ] Team member names + Ethereum addresses

### Partner Track Explanations (write these in submission form)
**ENS:** *"ENS is the identity backbone. Each agent owns a .agents.eth subname. ENSIP-25 text records store agent capabilities and AXL pubkey. Agents discover each other by resolving ENS names. No ENS = no identity, no discovery, no network."*

**KeeperHub:** *"All onchain operations — EAS attestation submissions and ENS text record updates — route through KeeperHub's MCP server for guaranteed execution with retry logic. We also demonstrate a failure-then-recovery scenario in the demo. Honest DX feedback in FEEDBACK.md."*

**Gensyn AXL:** *"Each agent runs a separate AXL node (3 separate processes, 3 ed25519 keypairs). Agents communicate exclusively via AXL — task delegation, verification requests, attestation proposals. AXL pubkeys stored in ENS text records = the ENS-anchored AXL discovery primitive."*

### Documentation
- [ ] README.md covers: what it does, architecture diagram, setup (5 steps to run), demo scenario walkthrough
- [ ] Code is commented at non-obvious points
- [ ] FEEDBACK.md covers KeeperHub DX: what worked, what didn't, what's missing
- [ ] `.env.example` present, actual keys not committed

---

## 12. FEEDBACK.md Template

```markdown
# KeeperHub Integration Feedback — SimoProof

## What We Built
Used KeeperHub's MCP server to handle all onchain operations for SimoProof agents:
EAS attestation submissions and ENS text record updates with retry guarantees.

## What Worked Well
- [Fill in during build]

## Friction Points
- [Fill in during build — be specific, e.g., "MCP server startup took 8s, no progress indicator"]

## Bugs Encountered
- [Fill in with steps to reproduce]

## Documentation Gaps
- [Fill in — where did you get stuck that docs didn't answer?]

## Feature Requests
- [Fill in — what would have made this 10x easier?]

## Integration Time
Setup: Xh | First working call: Xh | Full integration: Xh
```

> Fill this in honestly during the build. Judges reward real developer insight.

---

## 13. Verifiable References

All external dependencies verified as of 2026-04-30:

| Resource | URL | Status |
|----------|-----|--------|
| ETHGlobal Open Agents | https://ethglobal.com/events/openagents | ✅ Live |
| ENS Prize Track | https://ethglobal.com/events/openagents/prizes | ✅ Live |
| KeeperHub Prize | https://keeperhub.com/blog/008-first-hackathon-openagents | ✅ Live |
| Gensyn AXL Docs | https://docs.gensyn.ai/tech/agent-exchange-layer | ✅ Live |
| Gensyn AXL GitHub | https://github.com/gensyn-ai/axl | ✅ Live |
| ENSIP-25 | https://docs.ens.domains/building-with-ai/ | ✅ Live |
| ERC-8004 | https://eips.ethereum.org/EIPS/eip-8004 | ✅ Live |
| EAS (Sepolia) | https://easscan.org (Sepolia explorer) | ✅ Live |
| KeeperHub MCP Docs | https://docs.keeperhub.com/ai-tools | ✅ Live |
| EAS SDK | https://docs.attest.org/ | ✅ Live |
| ENS SDK (viem) | https://docs.ens.domains/ | ✅ Live |

---

*SPEC end. See PRD for product strategy, prize targeting rationale, and demo scenario narrative.*
