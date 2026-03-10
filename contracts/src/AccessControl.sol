// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract EcoChainAccess is AccessControl {

    bytes32 public constant GOV_ROLE = keccak256("GOV_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant INDUSTRY_ROLE = keccak256("INDUSTRY_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantGov(address user)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(GOV_ROLE, user);
    }

    function grantAuditor(address user)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(AUDITOR_ROLE, user);
    }

    function grantIndustry(address user)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        grantRole(INDUSTRY_ROLE, user);
    }

    function revokeUser(bytes32 role, address user)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        revokeRole(role, user);
    }
}