// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/// @title DiscoveryVerifier
/// @notice Verifies Risc0 ZK proofs for SimoProof discoveries and creates EAS attestations.
///
/// Flow:
/// 1. Caller submits: Groth16 seal, ABI-encoded journal (public ZK outputs), 0G CID, ENS name
/// 2. Contract verifies seal against guestImageId via IRiscZeroVerifier
/// 3. Contract checks journal gates: confidenceMet && consensusMet && causalValid
/// 4. Contract creates non-revocable EAS attestation with all proof data
/// 5. Emits DiscoveryVerified event for indexing

interface IRiscZeroVerifier {
    function verify(
        bytes calldata seal,
        bytes32 imageId,
        bytes32 journalDigest
    ) external view;
}

interface IEAS {
    struct AttestationRequestData {
        address recipient;
        uint64  expirationTime;
        bool    revocable;
        bytes32 refUID;
        bytes   data;
        uint256 value;
    }
    struct AttestationRequest {
        bytes32                schema;
        AttestationRequestData data;
    }
    function attest(AttestationRequest calldata request) external payable returns (bytes32);
}

contract DiscoveryVerifier {

    IRiscZeroVerifier public immutable risc0Verifier;
    bytes32           public immutable guestImageId;
    IEAS              public immutable eas;
    bytes32           public immutable discoverySchemaUid;

    event DiscoveryVerified(
        bytes32 indexed claimHash,
        bytes32 indexed easUid,
        address indexed atlasNode,
        bytes32         sourceCommitment,
        bytes32         consensusHash
    );

    constructor(
        address _risc0Verifier,
        bytes32 _guestImageId,
        address _eas,
        bytes32 _discoverySchemaUid
    ) {
        risc0Verifier      = IRiscZeroVerifier(_risc0Verifier);
        guestImageId       = _guestImageId;
        eas                = IEAS(_eas);
        discoverySchemaUid = _discoverySchemaUid;
    }

    /// @notice Verify a Risc0 ZK proof and create a permanent EAS attestation.
    /// @param seal         Groth16 proof bytes from Risc0 Bonsai
    /// @param journalBytes ABI-encoded GuestOutput (public ZK outputs)
    /// @param ipfsCid      0G storage root hash for the full discovery package
    /// @param ensName      ENSIP-25 subname of the submitting discovery node
    /// @return easUid      EAS attestation UID (permanent, non-revocable)
    function submitDiscovery(
        bytes calldata seal,
        bytes calldata journalBytes,
        string calldata ipfsCid,
        string calldata ensName
    ) external returns (bytes32 easUid) {

        // 1. Verify the ZK proof on-chain
        // risc0Verifier.verify reverts if the proof is invalid
        risc0Verifier.verify(seal, guestImageId, sha256(journalBytes));

        // 2. Decode and gate-check public journal outputs
        (
            bytes32 claimHash,
            bytes32 sourceCommitment,
            bytes32 consensusHash,
            bool    confidenceMet,
            bool    consensusMet,
            bool    causalValid,
            /* uint64 timestamp */
        ) = abi.decode(journalBytes, (bytes32, bytes32, bytes32, bool, bool, bool, uint64));

        require(confidenceMet, "SimoProof: confidence threshold not met (need >= 0.85)");
        require(consensusMet,  "SimoProof: Simocracy consensus not met (need 3/4 endorsements)");
        require(causalValid,   "SimoProof: causal validity failed (need source + confidence >= 0.70)");

        // 3. Create permanent, non-revocable EAS attestation
        easUid = eas.attest(
            IEAS.AttestationRequest({
                schema: discoverySchemaUid,
                data: IEAS.AttestationRequestData({
                    recipient:      msg.sender,
                    expirationTime: 0,         // never expires
                    revocable:      false,      // permanent
                    refUID:         bytes32(0),
                    data: abi.encode(
                        claimHash,
                        sourceCommitment,
                        consensusHash,
                        seal,
                        ipfsCid,
                        msg.sender,
                        ensName
                    ),
                    value: 0
                })
            })
        );

        emit DiscoveryVerified(claimHash, easUid, msg.sender, sourceCommitment, consensusHash);
    }

    /// @notice View-only proof check without state change or EAS attestation.
    /// @return true if the proof is valid against the deployed guestImageId
    function verifyProof(
        bytes calldata seal,
        bytes calldata journalBytes
    ) external view returns (bool) {
        try risc0Verifier.verify(seal, guestImageId, sha256(journalBytes)) {
            return true;
        } catch {
            return false;
        }
    }

    /// @notice Returns the ABI type string for the EAS schema.
    function schemaString() external pure returns (string memory) {
        return "bytes32 claim_hash,bytes32 source_commitment,bytes32 consensus_hash,bytes zk_proof,string ipfs_cid,address atlas_node,string ens_name";
    }
}
