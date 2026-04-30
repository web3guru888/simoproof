// SimoProof — Shared TypeScript Types
// These types flow through the entire pipeline.

export interface DiscoveryRecord {
  id: string;
  claim: string;
  claimHash: number[];           // SHA256(claim), 32 bytes
  rawSourceBytes: Buffer[];      // private — only SHA256 hash leaves this node
  apiSourceHashes: number[][];   // public — 32-byte SHA256 of each raw response
  confidence: number;            // 0.0–1.0
  causalSummary: string;         // human-readable causal chain for demo
  sourceDescription: string;     // URL or description of source
  timestamp: number;             // Unix epoch seconds
  status: 'pending' | 'validating' | 'proving' | 'attesting' | 'complete' | 'failed';
}

export interface SimocracyResult {
  consensusMet: boolean;
  voteCount: number;              // 0–4 endorsements
  atprotoCid: string;             // CID of ATProto deliberation record (or mini-senate ID)
  consensusHash: `0x${string}`;  // keccak256(atprotoCid || transcript)
  transcript: string;             // Full deliberation transcript
}

export interface ProofOutput {
  seal: `0x${string}`;            // Groth16 proof bytes (or dev-mode receipt)
  journalBytes: `0x${string}`;    // ABI-encoded GuestOutput (public outputs)
  imageId: `0x${string}`;         // Risc0 guest program image ID
  claimHash: `0x${string}`;
  sourceCommitment: `0x${string}`;
  consensusHash: `0x${string}`;
  confidenceMet: boolean;
  consensusMet: boolean;
  causalValid: boolean;
  timestamp: number;
}

export interface AttestationResult {
  easUid: `0x${string}`;
  txHash: `0x${string}`;
  blockNumber: number;
  ipfsCid: string;                // 0G root hash (or IPFS fallback)
}

export interface PipelineResult {
  discoveryId: string;
  claim: string;
  proof: ProofOutput;
  attestation: AttestationResult;
  simocracy: SimocracyResult;
  ensUpdated: boolean;
  durationMs: number;
}

export interface AxlMessage {
  fromPeerId: string;
  body: Uint8Array;
  timestamp: number;
}

export interface PreValidationResponse {
  nodeId: string;
  peerId: string;
  preScore: number;   // 0.0–1.0
  concerns: string[];
}

export interface DiscoveryBroadcast {
  type: 'discovery_broadcast';
  claimHash: string;          // hex
  apiSourceHashes: string[];  // hex[]
  confidence: number;
  causalSummary: string;
  timestamp: number;
}

export interface DiscoveryPackage {
  discovery: Omit<DiscoveryRecord, 'rawSourceBytes'> & { rawSourceBytes: string };
  proof: ProofOutput;
  simocracyResult: SimocracyResult;
  easUid?: string;
  uploadedAt: string;
}
