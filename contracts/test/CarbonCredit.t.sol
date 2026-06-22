// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CarbonCredit} from "../src/CarbonCredit.sol";

contract CarbonCreditTest is Test {
    CarbonCredit credit;
    address owner = address(1);
    address minter = address(1);
    address user = address(2);

    function setUp() public {
        vm.prank(owner);
        credit = new CarbonCredit();
    }

    function testNameAndSymbol() public view {
        assertEq(credit.name(), "EcoChain Carbon Credit");
        assertEq(credit.symbol(), "CCR");
    }

    function testIssueCredits() public {
        vm.prank(owner);
        credit.issueCredits(user, 1000);
        assertEq(credit.balanceOf(user), 1000);
    }

    function testRetireCredits() public {
        vm.prank(owner);
        credit.issueCredits(user, 1000);
        
        vm.prank(user);
        credit.retireCredits(user, 400);
        
        assertEq(credit.balanceOf(user), 600);
    }
}
