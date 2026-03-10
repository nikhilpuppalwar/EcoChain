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

        vm.startBroadcast();

        new EcoChainAccess();

        CarbonCredit token = new CarbonCredit();

        new CarbonMarketplace(address(token));

        new CreditRetirement(address(token));

        new AuditRegistry();

        vm.stopBroadcast();
    }
}