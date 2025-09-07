// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Exchange {
    address public feeAccount;

    constructor(address _feeAccount) {
        feeAccount = _feeAccount;
    }
}
