import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer, buyerFeeSigner } = await getNamedAccounts();

  const transferProxy = await deployments.get("TransferProxy");
  const transferProxyForDeprecated = await deployments.get(
    "TransferProxyForDeprecated"
  );
  const erc20TransferProxy = await deployments.get("ERC20TransferProxy");
  const exchangeStateV1 = await deployments.get("ExchangeStateV1");
  const exchangeV1 = await deployments.get("ExchangeV1");

  const transferProxyContract = await ethers.getContractAt(
    "TransferProxy",
    transferProxy.address
  );
  const transferProxyForDeprecatedContract = await ethers.getContractAt(
    "TransferProxyForDeprecated",
    transferProxyForDeprecated.address
  );
  const erc20TransferProxyContract = await ethers.getContractAt(
    "ERC20TransferProxy",
    erc20TransferProxy.address
  );
  const exchangeStateV1Contract = await ethers.getContractAt(
    "ExchangeStateV1",
    exchangeStateV1.address
  );
  console.log("add operator: ", exchangeV1.address);
  if (!(await transferProxyContract.isOperator(exchangeV1.address))) {
    await transferProxyContract.addOperator(exchangeV1.address);
  }
  if (
    !(await transferProxyForDeprecatedContract.isOperator(exchangeV1.address))
  ) {
    await transferProxyForDeprecatedContract.addOperator(exchangeV1.address);
  }
  if (!(await erc20TransferProxyContract.isOperator(exchangeV1.address))) {
    await erc20TransferProxyContract.addOperator(exchangeV1.address);
  }
  if (!(await exchangeStateV1Contract.isOperator(exchangeV1.address))) {
    await exchangeStateV1Contract.addOperator(exchangeV1.address);
  }

  // erc721 and erc1155
  console.log("add operator: ", buyerFeeSigner);
  const MintableToken = await deployments.get("MintableToken");
  const mintableToken = await ethers.getContractAt(
    "MintableToken",
    MintableToken.address
  );
  const VVMToken = await deployments.get("VVMToken");
  const vvmToken = await ethers.getContractAt("VVMToken", VVMToken.address);
  if (!(await vvmToken.isOperator(buyerFeeSigner))) {
    await vvmToken.addOperator(buyerFeeSigner);
  }
  if (!(await mintableToken.isOperator(buyerFeeSigner))) {
    await mintableToken.addOperator(buyerFeeSigner);
  }
  console.log(await mintableToken.isOperator(buyerFeeSigner));
  console.log(await vvmToken.isOperator(buyerFeeSigner));
};
export default func;
