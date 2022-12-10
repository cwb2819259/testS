import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, utils } from "ethers";
utils.AbiCoder;
import chai, { expect } from "chai";

chai.use(solidity);

describe("VVMToken", function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let VVMToken: ContractFactory;

  let vvmToken: Contract;

  before("setup accounts", async () => {
    [alice, bob, carol] = await ethers.getSigners();
  });

  before("deploy contract", async function () {
    VVMToken = await ethers.getContractFactory("VVMToken");

    vvmToken = await VVMToken.connect(alice).deploy();

    await vvmToken.deployed();
  });

  describe("VVMToken", () => {
    async function mint(tokenId: BigNumber, amount: BigNumber) {
      const message = utils.solidityKeccak256(
        ["address", "uint256"],
        [vvmToken.address, tokenId]
      );

      const signature = await alice.signMessage(message.slice(2));
      const { r, s, v } = utils.splitSignature(signature);

      await vvmToken
        .connect(alice)
        .mint(
          tokenId,
          v,
          r,
          s,
          [{ recipient: bob.address, value: 100 }],
          amount,
          "/a/b.img"
        );
    }

    before(async function () {
      await vvmToken.setTokenURIPrefix("https://www.baidu.com");
      await vvmToken.addOperator(alice.address);
    });

    it("mint erc721", async function () {
      const tokenId = BigNumber.from("1");
      const amount = BigNumber.from("20");

      await mint(tokenId, amount);

      console.log(await vvmToken.uri(tokenId));
      console.log(await vvmToken.balanceOf(alice.address, tokenId));

      expect((await vvmToken.balanceOf(alice.address, tokenId)).toString()).eq(
        amount.toString()
      );
    });

    it("setApprovalForAll", async function () {
      const tokenId = BigNumber.from("2");
      const amount = BigNumber.from("20");

      await mint(tokenId, amount);

      await vvmToken.setApprovalForAll(bob.address, true);
      expect(await vvmToken.isApprovedForAll(alice.address, bob.address)).true;

      await vvmToken
        .connect(bob)
        .safeTransferFrom(
          alice.address,
          bob.address,
          tokenId,
          BigNumber.from("10"),
          "0x"
        );

      expect((await vvmToken.balanceOf(bob.address, tokenId)).toString()).eq(
        "10"
      );

      await vvmToken.setApprovalForAll(bob.address, false);
      expect(await vvmToken.isApprovedForAll(alice.address, bob.address)).false;
    });
  });
});
