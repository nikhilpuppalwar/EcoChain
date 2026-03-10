// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CarbonMarketplace
 * @notice Simple peer‑to‑peer marketplace aligned with the ABI used in the web app.
 *
 * Expected functions (from ABI used by `useMarketplace`):
 * - carbonCreditToken() -> address
 * - nextListingId() -> uint256
 * - listings(uint256) -> (id, seller, amount, pricePerCredit, active)
 * - listCredits(uint256 _amount, uint256 _pricePerCredit)
 * - buyCredits(uint256 _listingId) payable
 * - cancelListing(uint256 _listingId)
 */
contract CarbonMarketplace is Ownable {
    struct Listing {
        uint256 id;
        address seller;
        uint256 amount;
        uint256 pricePerCredit;
        bool active;
    }

    IERC20 public carbonCreditToken;
    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amount,
        uint256 price
    );

    event Purchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalCost
    );

    event Cancelled(uint256 indexed listingId);

    constructor(address _carbonCreditToken) Ownable(msg.sender) {
        require(_carbonCreditToken != address(0), "invalid token");
        carbonCreditToken = IERC20(_carbonCreditToken);
    }

    /**
     * @notice List `amount` credits for sale at `pricePerCredit` wei per credit.
     * Caller must have approved this contract to transfer at least `amount` tokens.
     */
    function listCredits(uint256 _amount, uint256 _pricePerCredit) external {
        require(_amount > 0, "amount must be > 0");
        require(_pricePerCredit > 0, "price must be > 0");

        // Pull tokens into the marketplace for escrow
        bool ok = carbonCreditToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(ok, "token transfer failed");

        uint256 listingId = nextListingId;
        listings[listingId] = Listing({
            id: listingId,
            seller: msg.sender,
            amount: _amount,
            pricePerCredit: _pricePerCredit,
            active: true
        });

        emit Listed(listingId, msg.sender, _amount, _pricePerCredit);
        nextListingId = listingId + 1;
    }

    /**
     * @notice Buy all remaining credits from a listing.
     * Frontend currently passes the full `amount` from UI and total value via msg.value.
     * This function trusts the sent ETH amount and transfers all remaining credits.
     */
    function buyCredits(uint256 _listingId) external payable {
        Listing storage l = listings[_listingId];
        require(l.active, "inactive listing");
        require(l.amount > 0, "sold out");

        // Compute price for all remaining credits
        uint256 totalCost = l.amount * l.pricePerCredit;
        require(msg.value >= totalCost, "insufficient payment");

        uint256 amountToBuy = l.amount;
        l.amount = 0;
        l.active = false;

        // Transfer CCR to buyer
        bool ok = carbonCreditToken.transfer(msg.sender, amountToBuy);
        require(ok, "token payout failed");

        // Payout seller
        (bool sent, ) = payable(l.seller).call{value: totalCost}("");
        require(sent, "eth payout failed");

        emit Purchased(_listingId, msg.sender, amountToBuy, totalCost);
    }

    /**
     * @notice Cancel an active listing and return remaining credits to the seller.
     */
    function cancelListing(uint256 _listingId) external {
        Listing storage l = listings[_listingId];
        require(l.seller != address(0), "no listing");
        require(msg.sender == l.seller || msg.sender == owner(), "not seller");
        require(l.active, "already inactive");

        uint256 remaining = l.amount;
        l.amount = 0;
        l.active = false;

        if (remaining > 0) {
            bool ok = carbonCreditToken.transfer(l.seller, remaining);
            require(ok, "return failed");
        }

        emit Cancelled(_listingId);
    }
}
