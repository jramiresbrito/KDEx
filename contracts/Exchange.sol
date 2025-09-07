// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;
    mapping(address => mapping(address => uint256)) public balances;

    event Deposit(
        address indexed user,
        address indexed tokenAddress,
        uint256 amount,
        uint256 balance
    );

    event Withdraw(
        address indexed user,
        address indexed tokenAddress,
        uint256 amount,
        uint256 balance
    );

    constructor(address _feeAccount, uint256 _feePercentage) {
        feeAccount = _feeAccount;
        feePercentage = _feePercentage;
    }

    function balanceOf(
        address user,
        address tokenAddress
    ) public view returns (uint256) {
        return balances[user][tokenAddress];
    }

    function deposit(address tokenAddress, uint256 amount) public {
        require(amount > 0, "Deposit amount must be greater than 0");

        Token(tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][tokenAddress] += amount;

        emit Deposit(
            msg.sender,
            tokenAddress,
            amount,
            balances[msg.sender][tokenAddress]
        );
    }

    function withdraw(address tokenAddress, uint256 amount) public {
        require(amount > 0, "Withdraw amount must be greater than 0");
        require(
            balances[msg.sender][tokenAddress] >= amount,
            "Insufficient balance"
        );

        balances[msg.sender][tokenAddress] -= amount;
        Token(tokenAddress).transfer(msg.sender, amount);

        emit Withdraw(
            msg.sender,
            tokenAddress,
            amount,
            balances[msg.sender][tokenAddress]
        );
    }
}
