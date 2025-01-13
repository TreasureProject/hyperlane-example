// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyERC721 is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenCounter;
    string private _customBaseURI;

    constructor(
        string memory name_,
        string memory symbol_,
        string memory initialBaseURI_
    ) ERC721(name_, symbol_) {
        _customBaseURI = initialBaseURI_;
    }

    function mint(address recipient) public onlyOwner returns (uint256) {
        _tokenCounter.increment();
        uint256 newItemId = _tokenCounter.current();
        _mint(recipient, newItemId);
        return newItemId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _customBaseURI;
    }

    function setBaseURI(string memory newBaseURI_) public onlyOwner {
        _customBaseURI = newBaseURI_;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenCounter.current();
    }
}
