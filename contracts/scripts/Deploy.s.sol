// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/CarbonCredit.sol";
import "../src/CarbonMarketplace.sol";
import "../src/CreditRetirement.sol";
import "../src/AuditRegistry.sol";
import "../src/AccessControl.sol";

contract DeployEcoChain is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        vm.startBroadcast(deployerPrivateKey);

        new EcoChainAccess();

        CarbonCredit token = new CarbonCredit();

        new CarbonMarketplace(address(token));

        new CreditRetirement(address(token));

        new AuditRegistry();

        vm.stopBroadcast();
    }
}