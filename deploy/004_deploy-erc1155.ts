import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("VVMToken", {
    from: deployer,
    log: true,
  });

  const vvmToken = await ethers.getContract('VVMToken')

  await vvmToken.setTokenURIPrefix('ipfs://ipfs')

  console.log(await vvmToken.tokenURIPrefix())
};
export default func;
