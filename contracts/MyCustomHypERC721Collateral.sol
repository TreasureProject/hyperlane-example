// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import { HypERC721Collateral } from "@hyperlane-xyz/core/contracts/token/HypERC721Collateral.sol";

contract MyCustomHypERC721 is HypERC721Collateral {
    constructor(address erc721, address _mailbox) HypERC721Collateral(erc721, _mailbox) {}
}
