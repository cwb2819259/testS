// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./tokens/ERC1155.sol";
import "./role/OwnableOperatorRole.sol";
import "./utils/Bytes.sol";

contract VVMToken is OwnableOperatorRole, ERC1155 {
    using StringLibrary for string;
    using BytesLibrary for bytes32;

    function mint(uint256 id, uint8 v, bytes32 r, bytes32 s, Fee[] memory fees, uint256 supply, string memory uri) public {
        require(isOperator(keccak256(abi.encodePacked(this, id)).toString().recover(v, r, s)), "owner should sign tokenId");
        _mint(id, fees, supply, uri);
    }

    function burn(address _owner, uint256 _id, uint256 _value) external {
        _burn(_owner, _id, _value);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
        _setTokenURI(tokenId, _tokenURI);
    }

    function setTokenURIPrefix(string memory _tokenURIPrefix) external onlyOwner {
        _setTokenURIPrefix(_tokenURIPrefix);
    }
}