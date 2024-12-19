// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import {TokenRouter} from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";

/**
 * @title Unofficial and UNAUDITED Hyperlane ERC1155 Token Router
 * @notice Enables cross-chain ERC1155 token transfers using Hyperlane's messaging protocol
 * @dev Compatible with existing Hyperlane protocol deployments by packing tokenId and amount
 * into a single uint256. Uses standard TokenRouter interface without modifications.
 * Limitation: Both tokenId and amount must be <= type(uint128).max
 */

contract HypERC1155 is ERC1155SupplyUpgradeable, TokenRouter {
    string private _name;
    string private _symbol;
    mapping(uint256 => string) private _tokenURIs;

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

    constructor(address _mailbox) TokenRouter(_mailbox) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function initialize(
        string memory _uri,
        string memory tokenName,
        string memory tokenSymbol,
        address _hook,
        address _interchainSecurityModule,
        address _owner
    ) external initializer {
        __ERC1155_init(_uri);
        __ERC1155Supply_init();
        _MailboxClient_initialize(_hook, _interchainSecurityModule, _owner);
        _name = tokenName;
        _symbol = tokenSymbol;
    }

    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }

    function setURI(uint128 tokenId, string memory newuri) external onlyOwner {
        _tokenURIs[tokenId] = newuri;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        return super.uri(tokenId);
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

        if (balanceOf(msg.sender, tokenId) < amount) {
            revert InsufficientBalance(msg.sender, tokenId, amount);
        }

        _burn(msg.sender, tokenId, amount);
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
        _mint(recipient, tokenId, amount, "");
    }

    function _packValues(uint128 tokenId, uint128 amount) internal pure returns (uint256) {
        return (tokenId << 128) | amount;
    }

    function _unpackValues(uint256 packed) internal pure returns (uint128 tokenId, uint128 amount) {
        tokenId = uint128(packed >> 128);
        amount = uint128(packed & type(uint128).max);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155SupplyUpgradeable) {
        for (uint128 i = 0; i < ids.length; i++) {
            if (ids[i] > type(uint128).max) revert TokenTransferValueTooLarge(ids[i]);
            if (amounts[i] > type(uint128).max) revert TokenTransferValueTooLarge(amounts[i]);
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function balanceOf(address) public pure override(TokenRouter) returns (uint256) {
        revert UseERC1155BalanceOf();
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }
}
