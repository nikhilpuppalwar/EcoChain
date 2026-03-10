// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CarbonCredit} from "../src/CarbonCredit.sol";
import {CarbonMarketplace} from "../src/CarbonMarketplace.sol";

contract CarbonMarketplaceTest is Test {
    CarbonCredit credit;
    CarbonMarketplace marketplace;
    
    address owner = address(1);
    address seller = address(2);
    address buyer = address(3);

    event Listed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 price);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalCost);

    function setUp() public {
        vm.deal(buyer, 10 ether);

        vm.startPrank(owner);
        credit = new CarbonCredit();
        marketplace = new CarbonMarketplace(address(credit));
        
        credit.issueCredits(seller, 100);
        vm.stopPrank();
    }

    function testListCredits() public {
        vm.startPrank(seller);
        credit.approve(address(marketplace), 50);
        
        uint256 pricePerCredit = 0.1 ether;
        
        vm.expectEmit(true, true, false, true);
        emit Listed(0, seller, 50, pricePerCredit);
        
        marketplace.listCredits(50, pricePerCredit);
        vm.stopPrank();
        
        assertEq(credit.balanceOf(address(marketplace)), 50);
    }

    function testBuyCredits() public {
        vm.startPrank(seller);
        credit.approve(address(marketplace), 50);
        uint256 pricePerCredit = 0.1 ether;
        marketplace.listCredits(50, pricePerCredit);
        vm.stopPrank();

        uint256 totalCost = 50 * pricePerCredit; // 5 ether
        
        vm.startPrank(buyer);
        vm.expectEmit(true, true, false, true);
        emit Purchased(0, buyer, 50, totalCost);
        
        marketplace.buyCredits{value: totalCost}(0);
        vm.stopPrank();

        assertEq(credit.balanceOf(buyer), 50);
    }
}
