// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {DiscoveryVerifier} from "../src/DiscoveryVerifier.sol";

/// @notice Deploy DiscoveryVerifier to Base Sepolia.
///
/// Prerequisites (set in .env):
///   PRIVATE_KEY                  — deployer wallet
///   BASE_SEPOLIA_RPC             — Base Sepolia RPC URL
///   RISC0_VERIFIER_ADDRESS       — from risc0-ethereum releases (Base Sepolia)
///   GUEST_IMAGE_ID               — from `cargo run -p simoproof-prover -- image-id`
///
/// Run:
///   forge script contracts/script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    // Base Sepolia EAS contract (pre-deployed by EAS team)
    address constant EAS = 0x4200000000000000000000000000000000000021;

    // EAS Schema Registry on Base Sepolia
    address constant SCHEMA_REGISTRY = 0x4200000000000000000000000000000000000020;

    // Schema: must match DiscoveryVerifier.schemaString()
    string constant DISCOVERY_SCHEMA =
        "bytes32 claim_hash,"
        "bytes32 source_commitment,"
        "bytes32 consensus_hash,"
        "bytes zk_proof,"
        "string ipfs_cid,"
        "address atlas_node,"
        "string ens_name";

    function run() external {
        address risc0Verifier = vm.envAddress("RISC0_VERIFIER_ADDRESS");
        bytes32 imageId       = vm.envBytes32("GUEST_IMAGE_ID");

        vm.startBroadcast();

        // 1. Register EAS schema (non-revocable, no resolver during deploy)
        //    Resolver is set to DiscoveryVerifier address after deployment.
        //    For simplicity, we deploy with address(0) resolver and let submitDiscovery handle logic.
        bytes32 schemaUid = _registerSchema(address(0));
        console.log("Schema UID:", vm.toString(schemaUid));

        // 2. Deploy DiscoveryVerifier
        DiscoveryVerifier verifier = new DiscoveryVerifier(
            risc0Verifier,
            imageId,
            EAS,
            schemaUid
        );
        console.log("DiscoveryVerifier:", address(verifier));
        console.log("guestImageId:     ", vm.toString(imageId));
        console.log("Schema UID:       ", vm.toString(schemaUid));

        vm.stopBroadcast();

        console.log("\nAdd to .env:");
        console.log(string.concat("DISCOVERY_VERIFIER_ADDRESS=", vm.toString(address(verifier))));
        console.log(string.concat("DISCOVERY_SCHEMA_UID=", vm.toString(schemaUid)));
    }

    function _registerSchema(address resolver) internal returns (bytes32) {
        // ISchemaRegistry interface (minimal)
        (bool ok, bytes memory data) = SCHEMA_REGISTRY.call(
            abi.encodeWithSignature(
                "register(string,address,bool)",
                DISCOVERY_SCHEMA,
                resolver,
                false  // not revocable
            )
        );
        require(ok, "Schema registration failed");
        return abi.decode(data, (bytes32));
    }
}
