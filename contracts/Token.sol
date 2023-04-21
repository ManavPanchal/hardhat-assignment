// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
    constructor(string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol){}
}