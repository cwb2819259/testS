import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("TransferProxy", {
    from: deployer,
    log: true,
  });
  await deploy("TransferProxyForDeprecated", {
    from: deployer,
    log: true,
  });
  await deploy("ERC20TransferProxy", {
    from: deployer,
    log: true,
  });
};
export default func;
