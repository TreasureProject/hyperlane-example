// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {HypERC721} from "@hyperlane-xyz/core/contracts/token/HypERC721.sol";

contract MyCustomHypERC721 is HypERC721 {
    constructor(address _mailbox) HypERC721(_mailbox) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
