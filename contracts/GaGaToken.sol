// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GaGaToken is ERC20, Ownable {
  constructor() ERC20("GaGaToken", "GAGA") {}

  function mint(address account, uint256 amount) external onlyOwner {
    super._mint(account, amount);
  }

  function burn(address account, uint256 amount) external onlyOwner {
    super._burn(account, amount);
  }

  function setApproveTo(address spender, uint256 amount) external onlyOwner {
    super._approve(address(this), spender, amount);
  }
}