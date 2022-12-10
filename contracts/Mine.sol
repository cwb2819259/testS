// SPDX-License-Identifier: MIT

pragma solidity =0.7.6;
pragma experimental ABIEncoderV2;

import "./role/OwnableOperatorRole.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./utils/Uint.sol";
import "./utils/String.sol";
import "./utils/Bytes.sol";

contract Mine is OwnableOperatorRole {
    using SafeMath for uint;
    using StringLibrary for string;
    using UintLibrary for uint;
    using BytesLibrary for bytes32;

    event Claim(address indexed owner, uint value);
    event Value(address indexed owner, uint value);

    struct Balance {
        address recipient;
        uint256 value;
    }

    IERC20 public token;
    address public tokenOwner;
    mapping(address => uint) public claimed;

    function setToken(IERC20 _token) external onlyOwner {
        token = _token;
    }

    function setTokenOwner(address _tokenOwner) external onlyOwner {
        tokenOwner = _tokenOwner;
    }

    function claim(Balance[] memory _balances, uint8 v, bytes32 r, bytes32 s) public {
        require(isOperator(prepareMessage(_balances).recover(v, r, s)), "operator should sign balances");

        for (uint i = 0; i < _balances.length; i++) {
            address recipient = _balances[i].recipient;
            if (msg.sender == recipient) {
                uint toClaim = _balances[i].value.sub(claimed[recipient]);
                require(toClaim > 0, "nothing to claim");
                claimed[recipient] = _balances[i].value;
                require(token.transferFrom(tokenOwner, msg.sender, toClaim), "transfer is not successful");
                emit Claim(recipient, toClaim);
                emit Value(recipient, _balances[i].value);
                return;
            }
        }
        revert("msg.sender not found in receipients");
    }

    function doOverride(Balance[] memory _balances) public onlyOwner {
        for (uint i = 0; i < _balances.length; i++) {
            claimed[_balances[i].recipient] = _balances[i].value;
            emit Value(_balances[i].recipient, _balances[i].value);
        }
    }

    function prepareMessage(Balance[] memory _balances) public pure returns (string memory) {
        return keccak256(abi.encode(_balances)).toString();
    }
}