// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import { HypERC20 } from "@hyperlane-xyz/core/contracts/token/HypERC20.sol";

contract MyCustomHypERC20 is HypERC20 {
    constructor(uint8 _decimals, address _mailbox) HypERC20(_decimals, _mailbox) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
