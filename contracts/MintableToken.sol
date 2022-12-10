// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/ERC721Base.sol";
import "./utils/Bytes.sol";
import "./role/OwnableOperatorRole.sol";

contract MintableToken is Ownable, ERC721Base, OwnableOperatorRole {
    using StringLibrary for string;
    using BytesLibrary for bytes32;

    constructor (string memory name, string memory symbol) ERC721Base(name, symbol) {
        _registerInterface(bytes4(keccak256('MINT_WITH_ADDRESS')));
    }

    function mint(uint256 tokenId, uint8 v, bytes32 r, bytes32 s, Fee[] memory _fees, string memory tokenURI) public {
        require(isOperator(keccak256(abi.encodePacked(this, tokenId)).toString().recover(v, r, s)), "owner should sign tokenId");
        _mint(msg.sender, tokenId, _fees);
        _setTokenURI(tokenId, tokenURI);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
        _setTokenURI(tokenId, _tokenURI);
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _setBaseURI(baseURI_);
    }
}