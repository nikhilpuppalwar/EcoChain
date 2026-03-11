// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CarbonCredit.sol";
import "../src/CarbonMarketplace.sol";

/**
 * Run after Deploy.s.sol so listing 0 exists for the marketplace UI.
 * Uses default Anvil deploy addresses. You must use the SAME private key as deploy
 * (the issuer is the deployer). Mint credits to deployer, approve, then list.
 *
 * Usage (with Anvil running and after deploy):
 *   forge script scripts/SeedMarketplace.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
 *
 * If your Deploy.s.sol used different addresses, update tokenAddr and marketAddr below.
 */
contract SeedMarketplace is Script {
    function run() external {
        // Must match Deploy.s.sol order: EcoChainAccess, CarbonCredit, CarbonMarketplace, ...
        address tokenAddr = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;  // CarbonCredit (2nd deployed)
        address marketAddr = 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0; // CarbonMarketplace (3rd deployed)

        vm.startBroadcast();

        CarbonCredit token = CarbonCredit(payable(tokenAddr));
        CarbonMarketplace market = CarbonMarketplace(payable(marketAddr));

        uint256 amount = 5000;
        uint256 pricePerCredit = 0.00001 ether; // 0.00001 ETH per credit

        token.issueCredits(msg.sender, amount);
        token.approve(marketAddr, amount);
        market.listCredits(amount, pricePerCredit);

        vm.stopBroadcast();
    }
}
