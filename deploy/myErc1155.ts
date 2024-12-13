import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Configuration for the ERC1155 token
  const NAME = "My NFT Collection";
  const SYMBOL = "MNFT";
  const BASE_URI = "ipfs://YOUR_IPFS_CID/"; // Replace with your actual IPFS URI

  await deploy('MyERC1155', {
    from: deployer,
    args: [NAME, SYMBOL, BASE_URI],
    log: true,
    waitConfirmations: 1,
  });
};

func.tags = ['MyERC1155'];
export default func;
