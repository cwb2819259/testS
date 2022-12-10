import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, utils } from "ethers";
utils.AbiCoder;
import chai from "chai";

chai.use(solidity);

describe("MintableToken", function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let MintableToken: ContractFactory;

  let mintableToken: Contract;

  before("setup accounts", async () => {
    [alice, bob, carol] = await ethers.getSigners();
  });

  before("deploy contract", async function () {
    MintableToken = await ethers.getContractFactory("MintableToken");

    mintableToken = await MintableToken.connect(alice).deploy(
      "Test ERC721",
      "vvm"
    );

    await mintableToken.deployed();
  });

  describe("MintableToken", () => {
    before(async function () {
      await mintableToken.setBaseURI("https://www.baidu.com");
      await mintableToken.addOperator(alice.address);
    });

    it("mint erc721", async function () {
      const tokenId = BigNumber.from("1");

      const message = utils.solidityKeccak256(
        ["address", "uint256"],
        [mintableToken.address, tokenId]
      );

      const signature = await alice.signMessage(message.slice(2));
      const { r, s, v } = utils.splitSignature(signature);

      await mintableToken.mint(
        tokenId,
        v,
        r,
        s,
        [{ recipient: bob.address, value: 100 }],
        "/a/b.img"
      );

      console.log(await mintableToken.tokenURI(tokenId));
    });
  });
});
