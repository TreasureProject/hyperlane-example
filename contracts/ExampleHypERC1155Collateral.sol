// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {TokenRouter} from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

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

    constructor(address erc1155_, address mailbox_) TokenRouter(mailbox_) {
        wrappedToken = IERC1155MetadataURI(erc1155_);
    }

    function initialize(
        address hook_,
        address interchainSecurityModule_,
        address owner_
    ) public virtual initializer {
        _MailboxClient_initialize(hook_, interchainSecurityModule_, owner_);
    }

    function transferRemote(
        uint32 destination_,
        bytes32 recipient_,
        uint128 tokenId_,
        uint128 amount_
    ) external payable returns (bytes32) {
        uint256 packed = _packValues(tokenId_, amount_);
        emit RemoteTransfer(destination_, recipient_, tokenId_, amount_);
        return this.transferRemote(destination_, recipient_, packed);
    }

    function _transferFromSender(uint256 packed_) internal virtual override returns (bytes memory) {
        (uint128 tokenId, uint128 amount) = _unpackValues(packed_);
        wrappedToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        return "";
    }

    function transferRemoteBatch(
        uint32 destination_,
        bytes32 recipient_,
        uint128[] calldata tokenIds_,
        uint128[] calldata amounts_
    ) external payable returns (uint128[] memory remainingIds, uint128[] memory remainingAmounts) {
        if (tokenIds_.length == 0 || amounts_.length == 0) {
            revert EmptyArrays();
        }

        if (tokenIds_.length != amounts_.length) {
            revert TokenTransferLengthMismatch(uint128(tokenIds_.length), uint128(amounts_.length));
        }

        for (uint128 i = 0; i < tokenIds_.length; i++) {
            try
                this.transferRemote(
                    destination_,
                    recipient_,
                    _packValues(tokenIds_[i], amounts_[i])
                )
            {} catch {
                uint128 remaining = uint128(tokenIds_.length) - i;
                remainingIds = new uint128[](remaining);
                remainingAmounts = new uint128[](remaining);
                for (uint128 j = 0; j < remaining; j++) {
                    remainingIds[j] = tokenIds_[i + j];
                    remainingAmounts[j] = amounts_[i + j];
                }
                return (remainingIds, remainingAmounts);
            }
        }
        return (new uint128[](0), new uint128[](0));
    }

    function _transferTo(
        address recipient_,
        uint256 packed_,
        bytes calldata
    ) internal virtual override {
        (uint128 tokenId, uint128 amount) = _unpackValues(packed_);
        wrappedToken.safeTransferFrom(address(this), recipient_, tokenId, amount, "");
    }

    function _packValues(uint128 tokenId_, uint128 amount_) internal pure returns (uint256) {
        return (tokenId_ << 128) | amount_;
    }

    function _unpackValues(
        uint256 packed_
    ) internal pure returns (uint128 tokenId, uint128 amount) {
        tokenId = uint128(packed_ >> 128);
        amount = uint128(packed_ & type(uint128).max);
    }

    function name() public view returns (string memory) {
        return IERC1155WithMetadata(address(wrappedToken)).name();
    }

    function symbol() public view returns (string memory) {
        return IERC1155WithMetadata(address(wrappedToken)).symbol();
    }

    function uri(uint256 id_) public view returns (string memory) {
        return wrappedToken.uri(id_);
    }

    function totalSupply(uint256 id_) public view returns (uint256) {
        return wrappedToken.balanceOf(address(this), id_);
    }

    function balanceOf(address) public pure override(TokenRouter) returns (uint256) {
        revert UseERC1155BalanceOf();
    }

    function balanceOf(address account_, uint256 id_) public view returns (uint256) {
        return wrappedToken.balanceOf(account_, id_);
    }
}
