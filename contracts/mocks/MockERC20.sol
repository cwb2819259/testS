// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor() ERC20("Mock ERC20", "mockERC20") {}

  function mint(address to, uint256 tokenId) external virtual {
    super._mint(to, tokenId);
  }
}