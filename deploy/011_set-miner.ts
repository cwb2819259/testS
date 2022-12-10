import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

export const UINT256_MAX = BigNumber.from(2)
  .pow(BigNumber.from(256))
  .sub(BigNumber.from(1));

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer, buyerFeeSigner } = await getNamedAccounts();

  const miner = await ethers.getContract("Mine");
  const gaga = await ethers.getContract("GaGaToken");
  await miner.setToken(gaga.address);
  await miner.setTokenOwner(gaga.address);
  await miner.addOperator(buyerFeeSigner);

  await gaga.setApproveTo(miner.address, UINT256_MAX);
};
export default func;
