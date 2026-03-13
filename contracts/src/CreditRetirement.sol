// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CarbonCredit} from "./CarbonCredit.sol";

contract CreditRetirement {

    struct RetirementRecord {
        address user;
        uint256 amount;
        string reason;
        uint256 period;
        uint256 timestamp;
    }

    CarbonCredit public token;

    RetirementRecord[] public records;

    // To prevent a user retiring credits for the same period twice:
    // mapping of user => (period => bool)
    mapping(address => mapping(uint256 => bool)) public isRetired;

    event Retired(address user, uint256 amount);

    constructor(address tokenAddress) {
        token = CarbonCredit(tokenAddress);
    }

    function retireCredits(
        uint256 amount,
        string memory reason,
        uint256 period
    ) external {
        require(!isRetired[msg.sender][period], "Credits already retired for this period");
        isRetired[msg.sender][period] = true;

        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
        token.burn(amount);

        records.push(
            RetirementRecord({
                user: msg.sender,
                amount: amount,
                reason: reason,
                period: period,
                timestamp: block.timestamp
            })
        );

        emit Retired(msg.sender, amount);
    }

    function getRetirementRecord(address user)
        external
        view
        returns (RetirementRecord[] memory)
    {
        uint count;

        for(uint i=0;i<records.length;i++){
            if(records[i].user == user){
                count++;
            }
        }

        RetirementRecord[] memory result = new RetirementRecord[](count);

        uint index;

        for(uint i=0;i<records.length;i++){
            if(records[i].user == user){
                result[index] = records[i];
                index++;
            }
        }

        return result;
    }
}