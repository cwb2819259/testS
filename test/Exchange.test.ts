import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { Contract, ContractFactory, BigNumber, utils } from "ethers";
import chai, { expect } from "chai";
import { verifyMessage } from "@ethersproject/wallet";
import { EMPTY_ADDRESS, getRsv, UINT256_MAX, ETHER } from "./util";
import { AssetType } from "./types";

chai.use(solidity);

describe("Exchange", function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;

  let TransferProxy: ContractFactory;
  let TransferProxyForDeprecated: ContractFactory;
  let ERC20TransferProxy: ContractFactory;
  let ExchangeV1: ContractFactory;
  let ExchangeOrdersHolderV1: ContractFactory;
  let ExchangeStateV1: ContractFactory;
  let MockERC721: ContractFactory;
  let MockERC20: ContractFactory;

  let transferProxy: Contract;
  let transferProxyForDeprecated: Contract;
  let erc20TransferProxy: Contract;
  let exchangeOrdersHolderV1: Contract;
  let exchangeStateV1: Contract;
  let exchangeV1: Contract;
  let mockErc721: Contract;
  let mockErc20: Contract;

  before("setup accounts", async () => {
    [alice, bob, carol] = await ethers.getSigners();
  });

  before("deploy contract", async function () {
    TransferProxy = await ethers.getContractFactory("TransferProxy");
    TransferProxyForDeprecated = await ethers.getContractFactory(
      "TransferProxyForDeprecated"
    );
    ERC20TransferProxy = await ethers.getContractFactory("ERC20TransferProxy");
    ExchangeV1 = await ethers.getContractFactory("ExchangeV1");
    ExchangeOrdersHolderV1 = await ethers.getContractFactory(
      "ExchangeOrdersHolderV1"
    );
    ExchangeStateV1 = await ethers.getContractFactory("ExchangeStateV1");
    MockERC721 = await ethers.getContractFactory("MockERC721");
    MockERC20 = await ethers.getContractFactory("MockERC20");

    transferProxy = await TransferProxy.connect(alice).deploy();
    transferProxyForDeprecated = await TransferProxyForDeprecated.connect(
      alice
    ).deploy();
    erc20TransferProxy = await ERC20TransferProxy.connect(alice).deploy();
    exchangeOrdersHolderV1 = await ExchangeOrdersHolderV1.connect(
      alice
    ).deploy();
    exchangeStateV1 = await ExchangeStateV1.connect(alice).deploy();

    await transferProxy.deployed();
    await transferProxyForDeprecated.deployed();
    await erc20TransferProxy.deployed();
    await exchangeOrdersHolderV1.deployed();
    await exchangeStateV1.deployed();
  });

  describe("ExchangeV1", () => {
    before("deploy exchange", async () => {
      exchangeV1 = await ExchangeV1.connect(alice).deploy(
        transferProxy.address,
        transferProxyForDeprecated.address,
        erc20TransferProxy.address,
        exchangeStateV1.address,
        exchangeOrdersHolderV1.address,
        alice.address,
        bob.address
      );
      mockErc721 = await MockERC721.connect(alice).deploy();
      mockErc20 = await MockERC20.connect(alice).deploy();
      await exchangeV1.deployed();
      await mockErc721.deployed();
      await mockErc20.deployed();

      await transferProxy.addOperator(exchangeV1.address);
      await transferProxyForDeprecated.addOperator(exchangeV1.address);
      await erc20TransferProxy.addOperator(exchangeV1.address);
      await exchangeStateV1.addOperator(exchangeV1.address);
    });

    it("buy erc721 use native", async function () {
      const tokenId = BigNumber.from("1");
      await mockErc721.mint(alice.address, tokenId);

      await mockErc721
        .connect(alice)
        .setApprovalForAll(transferProxy.address, true);

      const order = {
        key: {
          owner: alice.address,
          salt: BigNumber.from(1268434),
          sellAsset: {
            token: mockErc721.address,
            tokenId,
            assetType: AssetType.ERC721,
          },
          buyAsset: {
            token: EMPTY_ADDRESS,
            tokenId: 0,
            assetType: AssetType.ETH,
          },
        },
        selling: 1,
        buying: ETHER,
        sellerFee: BigNumber.from("250"),
      };

      const prepareMessage = await exchangeV1.prepareMessage(order);
      console.log("prepareMessage: ", prepareMessage);
      const signature = await alice.signMessage(prepareMessage);
      console.log("signature: ", signature);
      expect(verifyMessage(prepareMessage, signature)).to.eq(alice.address);

      const buyFee = BigNumber.from(250);
      const prepareBuyerFeeMessage = await exchangeV1.prepareBuyerFeeMessage(
        order,
        buyFee
      );
      console.log("prepareBuyerFeeMessage: ", prepareBuyerFeeMessage);
      const buyFeeSignature = await bob.signMessage(prepareBuyerFeeMessage);
      console.log("buyFeeSignature: ", buyFeeSignature);
      expect(verifyMessage(prepareBuyerFeeMessage, buyFeeSignature)).to.eq(
        bob.address
      );

      await exchangeV1
        .connect(bob)
        .exchange(
          order,
          getRsv(signature),
          buyFee,
          getRsv(buyFeeSignature),
          BigNumber.from("1"),
          bob.address,
          {
            value: utils
              .parseEther("1")
              .mul(BigNumber.from(10250))
              .div(BigNumber.from(10000)),
          }
        );

      expect(await mockErc721.ownerOf(tokenId)).to.eq(bob.address);
    });

    it("buy erc721 use erc20", async function () {
      const tokenId = BigNumber.from("2");
      await mockErc721.mint(alice.address, tokenId);
      await mockErc20.mint(bob.address, BigNumber.from("1000000").mul(ETHER));

      await mockErc721
        .connect(alice)
        .setApprovalForAll(transferProxy.address, true);

      await mockErc20
        .connect(bob)
        .approve(erc20TransferProxy.address, UINT256_MAX);

      const order = {
        key: {
          owner: alice.address,
          salt: BigNumber.from(1268434),
          sellAsset: {
            token: mockErc721.address,
            tokenId,
            assetType: AssetType.ERC721,
          },
          buyAsset: {
            token: mockErc20.address,
            tokenId: 0,
            assetType: AssetType.ERC20,
          },
        },
        selling: 1,
        buying: ETHER,
        sellerFee: BigNumber.from("250"),
      };

      const prepareMessage = await exchangeV1.prepareMessage(order);
      console.log("prepareMessage: ", prepareMessage);
      const signature = await alice.signMessage(prepareMessage);
      console.log("signature: ", signature);
      expect(verifyMessage(prepareMessage, signature)).to.eq(alice.address);

      const buyFee = BigNumber.from(250);
      const prepareBuyerFeeMessage = await exchangeV1.prepareBuyerFeeMessage(
        order,
        buyFee
      );
      console.log("prepareBuyerFeeMessage: ", prepareBuyerFeeMessage);
      const buyFeeSignature = await bob.signMessage(prepareBuyerFeeMessage);
      console.log("buyFeeSignature: ", buyFeeSignature);
      expect(verifyMessage(prepareBuyerFeeMessage, buyFeeSignature)).to.eq(
        bob.address
      );

      await exchangeV1
        .connect(bob)
        .exchange(
          order,
          getRsv(signature),
          buyFee,
          getRsv(buyFeeSignature),
          BigNumber.from("1"),
          bob.address
        );

      const balanceBob: BigNumber = await mockErc20.balanceOf(bob.address);
      const balanceAlice: BigNumber = await mockErc20.balanceOf(alice.address);
      console.log(balanceBob.add(balanceAlice).toString());

      expect(await mockErc721.ownerOf(tokenId)).to.eq(bob.address);
    });

    it("buy erc20 use erc721", async function () {
      const tokenId = BigNumber.from("3");
      await mockErc721.mint(alice.address, tokenId);
      await mockErc20.mint(bob.address, BigNumber.from("1200000").mul(ETHER));

      await mockErc721
        .connect(alice)
        .setApprovalForAll(transferProxy.address, true);

      await mockErc20
        .connect(bob)
        .approve(erc20TransferProxy.address, UINT256_MAX);

      const order = {
        key: {
          owner: bob.address,
          salt: BigNumber.from(126843543),
          sellAsset: {
            token: mockErc20.address,
            tokenId: 0,
            assetType: AssetType.ERC20,
          },
          buyAsset: {
            token: mockErc721.address,
            tokenId: tokenId,
            assetType: AssetType.ERC721,
          },
        },
        selling: BigNumber.from("1000000").mul(ETHER),
        buying: 1,
        sellerFee: BigNumber.from("250"),
      };

      const prepareMessage = await exchangeV1.prepareMessage(order);
      console.log("prepareMessage: ", prepareMessage);
      const signature = await bob.signMessage(prepareMessage);
      console.log("signature: ", signature);
      expect(verifyMessage(prepareMessage, signature)).to.eq(bob.address);

      const buyFee = BigNumber.from(250);
      const prepareBuyerFeeMessage = await exchangeV1.prepareBuyerFeeMessage(
        order,
        buyFee
      );
      console.log("prepareBuyerFeeMessage: ", prepareBuyerFeeMessage);
      const buyFeeSignature = await bob.signMessage(prepareBuyerFeeMessage);
      console.log("buyFeeSignature: ", buyFeeSignature);
      expect(verifyMessage(prepareBuyerFeeMessage, buyFeeSignature)).to.eq(
        bob.address
      );

      await exchangeV1
        .connect(alice)
        .exchange(
          order,
          getRsv(signature),
          buyFee,
          getRsv(buyFeeSignature),
          BigNumber.from("1000000").mul(ETHER),
          alice.address
        );

      const balanceBob: BigNumber = await mockErc20.balanceOf(bob.address);
      const balanceAlice: BigNumber = await mockErc20.balanceOf(alice.address);
      console.log(balanceBob.toString());
      console.log(balanceAlice.toString());

      expect(await mockErc721.ownerOf(tokenId)).to.eq(bob.address);
    });
  });
});
