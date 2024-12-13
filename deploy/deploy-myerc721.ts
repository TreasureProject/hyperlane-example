import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Configuration for the ERC721 token
  const NAME = "My NFT";
  const SYMBOL = "MNFT";

  await deploy('MyERC721', {
    from: deployer,
    args: [NAME, SYMBOL],
    log: true,
    waitConfirmations: 1,
  });
};

func.tags = ['MyERC721'];
export default func;
