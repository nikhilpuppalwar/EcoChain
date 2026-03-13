// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract AuditRegistry is AccessControl {

    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct Report {
        uint256 industryId;
        bytes32 reportHash;
        bytes auditorSignature;
        uint256 timestamp;
        string verificationStatus;
    }

    Report[] public reports;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    function storeReport(
        uint256 industryId,
        bytes32 reportHash,
        bytes memory auditorSig,
        string memory verificationStatus
    )
        external
        onlyRole(AUDITOR_ROLE)
    {
        reports.push(
            Report({
                industryId: industryId,
                reportHash: reportHash,
                auditorSignature: auditorSig,
                timestamp: block.timestamp,
                verificationStatus: verificationStatus
            })
        );
    }

    function verifyReport(bytes32 hash)
        external
        view
        returns (bool)
    {
        for(uint i=0;i<reports.length;i++){
            if(reports[i].reportHash == hash){
                return true;
            }
        }
        return false;
    }

    function getReport(uint256 id)
        external
        view
        returns (Report memory)
    {
        return reports[id];
    }
}