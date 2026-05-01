/// Shared types between the guest and prover host.
/// Must match the struct definitions in simoproof-guest/src/main.rs.
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct GuestInput {
    pub raw_source_bytes:     Vec<Vec<u8>>,
    pub consensus_vote_count: u32,
    pub api_source_hashes:    Vec<[u8; 32]>,
    pub consensus_hash:       [u8; 32],
    pub claim:                String,
    pub confidence:           f64,
    pub confidence_threshold: f64,
    pub consensus_threshold:  u32,
    pub timestamp:             u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GuestOutput {
    pub claim_hash:        [u8; 32],
    pub source_commitment: [u8; 32],
    pub consensus_hash:    [u8; 32],
    pub confidence_met:    bool,
    pub consensus_met:     bool,
    pub causal_valid:      bool,
    pub timestamp:         u64,
}

/// JSON-serializable proof output, written to the output file.
/// Consumed by the TypeScript pipeline via execSync + readFileSync.
#[derive(Serialize, Deserialize, Debug)]
pub struct ProofOutputFile {
    pub seal:              String,   // hex-encoded bytes
    pub journal_bytes:     String,   // hex-encoded bytes
    pub image_id:          String,   // hex-encoded [u32; 8]
    pub claim_hash:        String,   // hex-encoded [u8; 32]
    pub source_commitment: String,
    pub consensus_hash:    String,
    pub confidence_met:    bool,
    pub consensus_met:     bool,
    pub causal_valid:      bool,
    pub timestamp:         u64,
    pub dev_mode:          bool,     // true if RISC0_DEV_MODE=true
}

/// Input file format from TypeScript pipeline.
#[derive(Serialize, Deserialize, Debug)]
pub struct ProverInputFile {
    pub raw_source_bytes:     Vec<Vec<u8>>,
    pub api_source_hashes:    Vec<[u8; 32]>,
    pub consensus_hash:       [u8; 32],
    pub consensus_vote_count: u32,
    pub claim:                String,
    pub confidence:           f64,
    pub timestamp:            u64,
}
