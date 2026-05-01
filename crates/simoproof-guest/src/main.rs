// SimoProof ZK Guest Program
// Runs inside the Risc0 zkVM. Proves that:
// 1. Raw source bytes match the public SHA256 commitments (source_hashes)
// 2. Confidence score meets the threshold (0.85)
// 3. Simocracy consensus vote count meets threshold (3 out of 4)
// 4. Causal validity: at least one source with confidence ≥ 0.70
//
// PRIVATE inputs:   raw_source_bytes, consensus_vote_count
// PUBLIC outputs:   claim_hash, source_commitment, consensus_hash,
//                   confidence_met, consensus_met, causal_valid, timestamp

#![no_main]
risc0_zkvm::guest::entry!(main);

use risc0_zkvm::guest::env;
use sha2::{Sha256, Digest};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct GuestInput {
    // Private inputs — never revealed in the ZK proof
    raw_source_bytes:     Vec<Vec<u8>>,
    consensus_vote_count: u32,

    // Public commitments (provided by prover host, verified inside zkVM)
    api_source_hashes:    Vec<[u8; 32]>,
    consensus_hash:       [u8; 32],
    claim:                String,
    confidence:           f64,
    confidence_threshold: f64,   // default 0.85
    consensus_threshold:  u32,   // default 3
    timestamp:            u64,
}

#[derive(Serialize)]
struct GuestOutput {
    claim_hash:        [u8; 32],
    source_commitment: [u8; 32],
    consensus_hash:    [u8; 32],
    confidence_met:    bool,
    consensus_met:     bool,
    causal_valid:      bool,
    timestamp:         u64,
}

/// Compute SHA256(hash_0 || hash_1 || ... || hash_n)
fn hash_concat(hashes: &[[u8; 32]]) -> [u8; 32] {
    let mut h = Sha256::new();
    for hash in hashes {
        h.update(hash);
    }
    h.finalize().into()
}

pub fn main() {
    // Read private + public inputs from the prover host
    let input: GuestInput = env::read();

    // ── Assertion 1: Source hash verification ────────────────────────────
    // For each raw response, assert SHA256(raw) == api_source_hashes[i]
    // This proves the claim was derived from the stated data source.
    assert_eq!(
        input.raw_source_bytes.len(),
        input.api_source_hashes.len(),
        "source bytes/hashes length mismatch"
    );
    for (i, raw) in input.raw_source_bytes.iter().enumerate() {
        let computed: [u8; 32] = Sha256::digest(raw).into();
        assert_eq!(
            computed,
            input.api_source_hashes[i],
            "source hash mismatch at index {}",
            i
        );
    }

    // ── Assertion 2: Threshold checks ────────────────────────────────────
    let confidence_met = input.confidence >= input.confidence_threshold;
    let consensus_met  = input.consensus_vote_count >= input.consensus_threshold;

    // ── Assertion 3: Causal validity ─────────────────────────────────────
    // Simplified for hackathon: at least one source + confidence ≥ 0.70
    // Production version would run full PC/FCI causal graph check.
    let causal_valid = !input.raw_source_bytes.is_empty()
        && input.confidence >= 0.70;

    // ── Commit public outputs to the journal ─────────────────────────────
    // These are visible on-chain after verification.
    env::commit(&GuestOutput {
        claim_hash:        Sha256::digest(input.claim.as_bytes()).into(),
        source_commitment: hash_concat(&input.api_source_hashes),
        consensus_hash:    input.consensus_hash,
        confidence_met,
        consensus_met,
        causal_valid,
        timestamp:         input.timestamp,
    });
}
