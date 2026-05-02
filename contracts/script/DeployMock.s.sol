// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockRiscZeroVerifier} from "../src/MockRiscZeroVerifier.sol";
import {DiscoveryVerifier}    from "../src/DiscoveryVerifier.sol";

/// @notice Deploy MockRiscZeroVerifier + DiscoveryVerifier for hackathon dev-mode demo.
///
/// Uses the EXISTING EAS schema UID (already registered — no double registration).
/// Uses the EXISTING guest IMAGE_ID (Rust guest ELF unchanged).
///
/// Prerequisites (.env):
///   PRIVATE_KEY              — deployer wallet
///   BASE_SEPOLIA_RPC         — Base Sepolia RPC
///   GUEST_IMAGE_ID           — from `cargo run -p simoproof-prover -- image-id`
///   DISCOVERY_SCHEMA_UID     — already registered in prior deployment
///
/// Run:
///   source /workspace/.shell-init.sh
///   export $(grep -v '^#' .env | grep '=' | xargs)
///   forge script contracts/script/DeployMock.s.sol \
///     --rpc-url $BASE_SEPOLIA_RPC --broadcast --legacy \
///     --private-key $PRIVATE_KEY
contract DeployMock is Script {
    // Base Sepolia EAS contract (Coinbase-maintained deployment)
    address constant EAS = 0x4200000000000000000000000000000000000021;

    function run() external {
        bytes32 imageId   = vm.envBytes32("GUEST_IMAGE_ID");
        bytes32 schemaUid = vm.envBytes32("DISCOVERY_SCHEMA_UID");

        vm.startBroadcast();

        // 1. Deploy mock verifier (accepts any dev-mode proof)
        MockRiscZeroVerifier mockVerifier = new MockRiscZeroVerifier();
        console.log("MockRiscZeroVerifier:", address(mockVerifier));

        // 2. Deploy DiscoveryVerifier with mock verifier + existing schema UID
        DiscoveryVerifier verifier = new DiscoveryVerifier(
            address(mockVerifier),
            imageId,
            EAS,
            schemaUid
        );
        console.log("DiscoveryVerifier:", address(verifier));
        console.log("guestImageId:     ", vm.toString(imageId));
        console.log("schemaUid:        ", vm.toString(schemaUid));

        vm.stopBroadcast();

        console.log("\nUpdate .env:");
        console.log(string.concat("DISCOVERY_VERIFIER_ADDRESS=", vm.toString(address(verifier))));
        console.log(string.concat("MOCK_RISC0_VERIFIER=", vm.toString(address(mockVerifier))));
    }
}
