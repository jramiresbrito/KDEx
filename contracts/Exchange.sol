// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercentage;
    uint256 public totalOrders;

    mapping(address => mapping(address => uint256)) public balances;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public isOrderCancelled;
    mapping(uint256 => bool) public isOrderFilled;

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGiven;
        uint256 amountGiven;
        uint256 timestamp;
    }

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

    event Order(
        uint256 indexed id,
        address indexed user,
        address indexed tokenGet,
        uint256 amountGet,
        address tokenGiven,
        uint256 amountGiven,
        uint256 timestamp
    );

    event OrderCancelled(
        uint256 indexed id,
        address indexed user,
        address indexed tokenGet,
        uint256 amountGet,
        address tokenGiven,
        uint256 amountGiven,
        uint256 timestamp
    );

    event OrderFilled(
        uint256 indexed id,
        address indexed user,
        address indexed filler,
        address tokenGet,
        uint256 amountGet,
        address tokenGiven,
        uint256 amountGiven,
        uint256 timestamp
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

    function makeOrder(
        address tokenGet,
        uint256 amountGet,
        address tokenGiven,
        uint256 amountGiven
    ) public {
        require(amountGet > 0, "Amount get must be greater than 0");
        require(amountGiven > 0, "Amount given must be greater than 0");
        require(
            balances[msg.sender][tokenGiven] >= amountGiven,
            "Insufficient balance"
        );

        uint256 id = totalOrders++;

        orders[id] = _Order(
            id,
            msg.sender,
            tokenGet,
            amountGet,
            tokenGiven,
            amountGiven,
            block.timestamp
        );

        emit Order(
            id,
            msg.sender,
            tokenGet,
            amountGet,
            tokenGiven,
            amountGiven,
            block.timestamp
        );
    }

    function cancelOrder(uint256 id) public {
        _Order storage order = orders[id];

        require(order.id == id, "Order does not exist");
        require(
            order.user == msg.sender,
            "You are not the owner of this order"
        );
        require(!isOrderCancelled[id], "Order already cancelled");
        require(!isOrderFilled[id], "Order already filled");

        isOrderCancelled[id] = true;

        emit OrderCancelled(
            id,
            order.user,
            order.tokenGet,
            order.amountGet,
            order.tokenGiven,
            order.amountGiven,
            block.timestamp
        );
    }

    function fillOrder(uint256 id) public {
        _Order storage order = orders[id];

        require(order.id == id, "Order does not exist");
        require(!isOrderCancelled[id], "Order already cancelled");
        require(!isOrderFilled[id], "Order already filled");
        require(
            balances[order.user][order.tokenGiven] >= order.amountGiven,
            "The user who put the order does not have enough balance of token given"
        );
        require(
            balances[msg.sender][order.tokenGet] >= order.amountGet,
            "Insufficient balance"
        );

        balances[order.user][order.tokenGiven] -= order.amountGiven;
        balances[order.user][order.tokenGet] += order.amountGet;
        balances[msg.sender][order.tokenGet] -= order.amountGet;
        balances[msg.sender][order.tokenGiven] += order.amountGiven;

        isOrderFilled[id] = true;

        emit OrderFilled(
            id,
            order.user,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGiven,
            order.amountGiven,
            block.timestamp
        );
    }
}
