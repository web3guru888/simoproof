// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {DiscoveryVerifier, IEAS} from "../src/DiscoveryVerifier.sol";

/// @notice Unit tests for DiscoveryVerifier.
/// Full integration test (with real Risc0 proof) runs separately via scripts/demo.ts.
contract DiscoveryVerifierTest is Test {

    DiscoveryVerifier verifier;

    // Mock contracts
    MockRisc0Verifier mockRisc0;
    MockEAS           mockEas;

    bytes32 constant MOCK_IMAGE_ID  = bytes32(uint256(0xdeadbeef));
    bytes32 constant MOCK_SCHEMA_UID = bytes32(uint256(0xcafebabe));

    function setUp() public {
        mockRisc0 = new MockRisc0Verifier();
        mockEas   = new MockEAS();
        verifier  = new DiscoveryVerifier(
            address(mockRisc0),
            MOCK_IMAGE_ID,
            address(mockEas),
            MOCK_SCHEMA_UID
        );
    }

    function test_verifyProof_returns_false_for_bad_proof() public {
        mockRisc0.setShouldRevert(true);
        bool result = verifier.verifyProof(bytes("bad_seal"), bytes("bad_journal"));
        assertFalse(result);
    }

    function test_verifyProof_returns_true_for_good_proof() public {
        mockRisc0.setShouldRevert(false);
        bytes memory validJournal = _buildValidJournal();
        bool result = verifier.verifyProof(bytes("good_seal"), validJournal);
        assertTrue(result);
    }

    function test_submitDiscovery_reverts_on_bad_proof() public {
        mockRisc0.setShouldRevert(true);
        bytes memory journal = _buildValidJournal();
        vm.expectRevert();
        verifier.submitDiscovery(bytes("bad_seal"), journal, "cid123", "node-1.simoproof.eth");
    }

    function test_submitDiscovery_reverts_when_confidence_not_met() public {
        mockRisc0.setShouldRevert(false);
        bytes memory journal = _buildJournal(
            bytes32(0), bytes32(0), bytes32(0),
            false, true, true  // confidenceMet = false
        );
        vm.expectRevert("SimoProof: confidence threshold not met (need >= 0.85)");
        verifier.submitDiscovery(bytes("seal"), journal, "cid", "node-1.simoproof.eth");
    }

    function test_submitDiscovery_reverts_when_consensus_not_met() public {
        mockRisc0.setShouldRevert(false);
        bytes memory journal = _buildJournal(
            bytes32(0), bytes32(0), bytes32(0),
            true, false, true  // consensusMet = false
        );
        vm.expectRevert("SimoProof: Simocracy consensus not met (need 3/4 endorsements)");
        verifier.submitDiscovery(bytes("seal"), journal, "cid", "node-1.simoproof.eth");
    }

    function test_submitDiscovery_reverts_when_causal_invalid() public {
        mockRisc0.setShouldRevert(false);
        bytes memory journal = _buildJournal(
            bytes32(0), bytes32(0), bytes32(0),
            true, true, false  // causalValid = false
        );
        vm.expectRevert("SimoProof: causal validity failed (need source + confidence >= 0.70)");
        verifier.submitDiscovery(bytes("seal"), journal, "cid", "node-1.simoproof.eth");
    }

    function test_submitDiscovery_succeeds_and_returns_eas_uid() public {
        mockRisc0.setShouldRevert(false);
        bytes32 expectedUid = bytes32(uint256(0x1234567890));
        mockEas.setNextUid(expectedUid);

        bytes memory journal = _buildValidJournal();
        bytes32 uid = verifier.submitDiscovery(bytes("seal"), journal, "cid", "node-1.simoproof.eth");
        assertEq(uid, expectedUid);
    }

    function test_schemaString_correct() public {
        string memory schema = verifier.schemaString();
        assertEq(
            keccak256(bytes(schema)),
            keccak256(bytes("bytes32 claim_hash,bytes32 source_commitment,bytes32 consensus_hash,bytes zk_proof,string ipfs_cid,address atlas_node,string ens_name"))
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    function _buildValidJournal() internal pure returns (bytes memory) {
        return _buildJournal(
            bytes32(uint256(0xabc1)),
            bytes32(uint256(0xabc2)),
            bytes32(uint256(0xabc3)),
            true, true, true
        );
    }

    function _buildJournal(
        bytes32 claimHash,
        bytes32 sourceCommitment,
        bytes32 consensusHash,
        bool confidenceMet,
        bool consensusMet,
        bool causalValid
    ) internal pure returns (bytes memory) {
        return abi.encode(
            claimHash,
            sourceCommitment,
            consensusHash,
            confidenceMet,
            consensusMet,
            causalValid,
            uint64(1746038400)  // timestamp
        );
    }
}

// ── Mock contracts ────────────────────────────────────────────────────────

contract MockRisc0Verifier {
    bool private _shouldRevert;

    function setShouldRevert(bool value) external { _shouldRevert = value; }

    function verify(bytes calldata, bytes32, bytes32) external view {
        if (_shouldRevert) revert("MockRisc0: invalid proof");
    }
}

contract MockEAS is IEAS {
    bytes32 private _nextUid;

    function setNextUid(bytes32 uid) external { _nextUid = uid; }

    /// @dev Must match IEAS.attest signature exactly (includes payable modifier)
    function attest(AttestationRequest calldata) external payable override returns (bytes32) {
        return _nextUid;
    }
}
