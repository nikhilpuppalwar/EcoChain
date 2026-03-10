// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title CarbonCredit
 * @notice Minimal ERC20 implementation aligned with the frontend/backend ABI.
 *
 * The dApp expects the following functions to exist:
 * - balanceOf(address)
 * - transfer / transferFrom / approve (from ERC20)
 * - issueCredits(address,uint256)
 * - retireCredits(address,uint256)
 *
 * We keep the logic intentionally simple and enforce that:
 * - Only the designated `issuer` can call `issueCredits`
 * - `retireCredits(account, amount)` can only be called for the caller's own account
 */
contract CarbonCredit is ERC20 {
    /// @notice Address allowed to mint new credits (government / admin wallet)
    address public issuer;

    constructor() ERC20("EcoChain Carbon Credit", "CCR") {
        issuer = msg.sender;
    }

    modifier onlyIssuer() {
        _onlyIssuer();
        _;
    }

    function _onlyIssuer() internal view {
        require(msg.sender == issuer, "not issuer");
    }

    /**
     * @notice Issue (mint) new credits to `to`.
     * Signature must stay `issueCredits(address,uint256)` to match ABI.
     */
    function issueCredits(address to, uint256 amount) external onlyIssuer {
        _mint(to, amount);
    }

    /**
     * @notice Retire credits from `account`.
     * Frontend/backend call this with the connected wallet as `account`.
     * We enforce `account == msg.sender` so users can only retire their own balance.
     */
    function retireCredits(address account, uint256 amount) external {
        require(account == msg.sender, "can only retire own balance");
        _burn(account, amount);
    }

    /**
     * @notice Simple burn helper used by auxiliary contracts like CreditRetirement.
     * Matches the older interface `burn(uint256)` expected in the rest of the repo.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
