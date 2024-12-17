// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import { TokenRouter } from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import { TokenRouter } from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { ERC1155Holder } from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import { IERC1155MetadataURI } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

interface IERC1155WithMetadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}

/**
 * @title Unofficial and UNAUDITED Hyperlane ERC1155 Token Collateral
 * @notice Enables cross-chain transfers of existing ERC1155 tokens using Hyperlane
 * @dev Holds original tokens as collateral while wrapped versions are minted on other chains
 * @dev Compatible with existing Hyperlane protocol deployments by packing tokenId and amount
 * into a single uint256. Uses standard TokenRouter interface without modifications.
 * Limitation: Both tokenId and amount must be <= type(uint128).max
 */

contract HypERC1155Collateral is TokenRouter, ERC1155Holder {
    IERC1155MetadataURI public immutable wrappedToken;

    constructor(address erc1155, address _mailbox) TokenRouter(_mailbox) {
        wrappedToken = IERC1155MetadataURI(erc1155);
    }

    function initialize(
        address _hook,
        address _interchainSecurityModule,
        address _owner
    ) public virtual initializer {
        _MailboxClient_initialize(_hook, _interchainSecurityModule, _owner);
    }

    function transferRemote(
        uint32 destination,
        bytes32 recipient,
        uint256 tokenId,
        uint256 amount
    ) external payable returns (bytes32) {
        uint256 packed = _packValues(tokenId, amount);
        return this.transferRemote(destination, recipient, packed);
    }

    function _transferFromSender(uint256 packed) internal virtual override returns (bytes memory) {
        (uint256 tokenId, uint256 amount) = _unpackValues(packed);

        wrappedToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        return ""; // No additional metadata needed
    }

    function _transferTo(
        address recipient,
        uint256 packed,
        bytes calldata // metadata not used
    ) internal virtual override {
        (uint256 tokenId, uint256 amount) = _unpackValues(packed);
        wrappedToken.safeTransferFrom(address(this), recipient, tokenId, amount, "");
    }

    function _packValues(uint256 tokenId, uint256 amount) internal pure returns (uint256) {
        require(tokenId <= type(uint128).max, "TokenId too large");
        require(amount <= type(uint128).max, "Amount too large");
        return (tokenId << 128) | amount;
    }

    function _unpackValues(uint256 packed) internal pure returns (uint256 tokenId, uint256 amount) {
        tokenId = packed >> 128;
        amount = packed & type(uint128).max;
    }

    function name() public view returns (string memory) {
        return IERC1155WithMetadata(address(wrappedToken)).name();
    }

    function symbol() public view returns (string memory) {
        return IERC1155WithMetadata(address(wrappedToken)).symbol();
    }
    function uri(uint256 id) public view returns (string memory) {
        return wrappedToken.uri(id);
    }

    function totalSupply(uint256 id) public view returns (uint256) {
        return wrappedToken.balanceOf(address(this), id);
    }

    function balanceOf(address) public pure override(TokenRouter) returns (uint256) {
        revert("Use balanceOf(address,uint256)");
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        return wrappedToken.balanceOf(account, id);
    }
}
