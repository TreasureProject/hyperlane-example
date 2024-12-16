// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

import { TokenRouter } from "@hyperlane-xyz/core/contracts/token/libs/TokenRouter.sol";
import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { ERC1155SupplyUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";

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

    event RemoteTransfer(
        uint32 indexed destination,
        bytes32 indexed recipient,
        uint256 indexed tokenId,
        uint256 amount
    );

    error InsufficientBalance(address from, uint256 tokenId, uint256 amount);

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

    function transferRemote(
        uint32 destination,
        bytes32 recipient,
        uint256 tokenId,
        uint256 amount
    ) external payable returns (bytes32) {
        uint256 packed = _packValues(tokenId, amount);
        emit RemoteTransfer(destination, recipient, tokenId, amount);
        return this.transferRemote(destination, recipient, packed);
    }

    function _transferFromSender(uint256 packed) internal virtual override returns (bytes memory) {
        (uint256 tokenId, uint256 amount) = _unpackValues(packed);

        if (balanceOf(msg.sender, tokenId) < amount) {
            revert InsufficientBalance(msg.sender, tokenId, amount);
        }

        _burn(msg.sender, tokenId, amount);
        return "";
    }

    function _transferTo(
        address recipient,
        uint256 packed,
        bytes calldata
    ) internal virtual override {
        (uint256 tokenId, uint256 amount) = _unpackValues(packed);
        _mint(recipient, tokenId, amount, "");
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

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155SupplyUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function balanceOf(address) public pure override(TokenRouter) returns (uint256) {
        revert("Use balanceOf(address,uint256)");
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }
}
