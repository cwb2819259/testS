import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MintableToken", {
    from: deployer,
    log: true,
    args: ['VVM ERC721', 'VVMERC721']
  });

  const mintableToken = await ethers.getContract('MintableToken')

  await mintableToken.setBaseURI('ipfs://ipfs')

  console.log(await mintableToken.baseURI())
};
export default func;
