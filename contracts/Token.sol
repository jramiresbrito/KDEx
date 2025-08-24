// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Follows the ERC20 standard: https://ethereum.org/en/developers/docs/standards/tokens/erc-20/
contract Token {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_from != address(0), "Cannot transfer from the zero address");
        require(_to != address(0), "Cannot transfer to the zero address");
        require(balanceOf[_from] >= _value, "Insufficient balance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _approve(
        address _owner,
        address _spender,
        uint256 _value
    ) internal {
        require(_owner != address(0), "Cannot approve the zero address");
        require(_spender != address(0), "Cannot approve the zero address");

        allowance[_owner][_spender] = _value;

        emit Approval(_owner, _spender, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        _approve(msg.sender, _spender, _value);

        return true;
    }
}
