// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/// @title MockRiscZeroVerifier
/// @notice Development-only mock for the IRiscZeroVerifier interface.
///         Accepts any proof without verification — use for hackathon demos
///         and testnet integration testing before switching to Bonsai Groth16 proofs.
///
/// ⚠️  NEVER deploy this to mainnet. Replace with the real RISC Zero Verifier Router
///     and a valid BONSAI_API_KEY before production use.
contract MockRiscZeroVerifier {
    /// @notice Always succeeds — never reverts.
    ///         Mirrors the IRiscZeroVerifier.verify() signature exactly.
    function verify(
        bytes calldata, /* seal */
        bytes32,        /* imageId */
        bytes32         /* journalDigest */
    ) external pure {
        // No-op: accept any proof in dev/hackathon mode
    }
}
