import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer, beneficiary, buyerFeeSigner } = await getNamedAccounts();

  const transferProxy = await deployments.get("TransferProxy");
  const transferProxyForDeprecated = await deployments.get(
    "TransferProxyForDeprecated"
  );
  const erc20TransferProxy = await deployments.get("ERC20TransferProxy");

  const holderV1 = await deploy("ExchangeOrdersHolderV1", {
    from: deployer,
    log: true,
  });
  const stateV1 = await deploy("ExchangeStateV1", {
    from: deployer,
    log: true,
  });
  await deploy("ExchangeV1", {
    from: deployer,
    args: [
      transferProxy.address,
      transferProxyForDeprecated.address,
      erc20TransferProxy.address,
      stateV1.address,
      holderV1.address,
      beneficiary,
      buyerFeeSigner,
    ],
    log: true,
  });
};
export default func;
