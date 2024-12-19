// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {TokenRouter} from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

/**
 * @title Unofficial and UNAUDITED Hyperlane ERC1155 Token Collateral
 * @notice Enables cross-chain transfers of existing ERC1155 tokens using Hyperlane
 * @dev Holds original tokens as collateral while wrapped versions are minted on other chains
 * @dev Compatible with existing Hyperlane protocol deployments by packing tokenId and amount
 * into a single uint256. Uses standard TokenRouter interface without modifications.
 * Limitation: Both tokenId and amount must be <= type(uint128).max
 */

interface IERC1155WithMetadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}

contract HypERC1155Collateral is TokenRouter, ERC1155Holder {
    IERC1155MetadataURI public immutable wrappedToken;

    event RemoteTransfer(
        uint32 indexed destination,
        bytes32 indexed recipient,
        uint128 indexed tokenId,
        uint128 amount
    );

    error InsufficientBalance(address from, uint128 tokenId, uint128 amount);
    error TokenTransferLengthMismatch(uint128 tokenIdLength, uint128 amountLength);
    error TokenTransferValueTooLarge(uint256 value);
    error EmptyArrays();
    error UseERC1155BalanceOf();
    error ZeroAmount();

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
        uint128 tokenId,
        uint128 amount
    ) external payable returns (bytes32) {
        uint256 packed = _packValues(tokenId, amount);
        emit RemoteTransfer(destination, recipient, tokenId, amount);
        return this.transferRemote(destination, recipient, packed);
    }

    function _transferFromSender(uint256 packed) internal virtual override returns (bytes memory) {
        (uint128 tokenId, uint128 amount) = _unpackValues(packed);
        wrappedToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        return "";
    }

    function transferRemoteBatch(
        uint32 destination,
        bytes32 recipient,
        uint128[] calldata tokenIds,
        uint128[] calldata amounts
    ) external payable returns (uint128[] memory remainingIds, uint128[] memory remainingAmounts) {
        if (tokenIds.length == 0 || amounts.length == 0) revert EmptyArrays();

        if (tokenIds.length != amounts.length) {
            revert TokenTransferLengthMismatch(uint128(tokenIds.length), uint128(amounts.length));
        }

        for (uint128 i = 0; i < tokenIds.length; i++) {
            try
                this.transferRemote(destination, recipient, _packValues(tokenIds[i], amounts[i]))
            {} catch {
                uint128 remaining = uint128(tokenIds.length) - i;
                remainingIds = new uint128[](remaining);
                remainingAmounts = new uint128[](remaining);
                for (uint128 j = 0; j < remaining; j++) {
                    remainingIds[j] = tokenIds[i + j];
                    remainingAmounts[j] = amounts[i + j];
                }
                return (remainingIds, remainingAmounts);
            }
        }
        return (new uint128[](0), new uint128[](0));
    }

    function _transferTo(
        address recipient,
        uint256 packed,
        bytes calldata
    ) internal virtual override {
        (uint128 tokenId, uint128 amount) = _unpackValues(packed);
        wrappedToken.safeTransferFrom(address(this), recipient, tokenId, amount, "");
    }

    function _packValues(uint128 tokenId, uint128 amount) internal pure returns (uint256) {
        return (tokenId << 128) | amount;
    }

    function _unpackValues(uint256 packed) internal pure returns (uint128 tokenId, uint128 amount) {
        tokenId = uint128(packed >> 128);
        amount = uint128(packed & type(uint128).max);
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
        revert UseERC1155BalanceOf();
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        return wrappedToken.balanceOf(account, id);
    }
}
