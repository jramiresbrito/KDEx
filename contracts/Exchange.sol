// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;

    constructor(address _feeAccount, uint256 _feePercentage) {
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }
}
