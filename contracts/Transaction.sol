// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Transaction {
    event Transfer(address indexed from, address indexed to, uint256 amount, string message, uint256 timestamp);

    function sendFunds(address payable _to, string memory _message) public payable {
        require(msg.value > 0, "Send some ETH");
        _to.transfer(msg.value);
        emit Transfer(msg.sender, _to, msg.value, _message, block.timestamp);
    }
}
