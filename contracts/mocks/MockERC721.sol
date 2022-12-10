// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
  constructor() ERC721("Mock ERC721", "mockerc721") {}

  function mint(address to, uint256 tokenId) external virtual {
    super._mint(to, tokenId);
  }
}