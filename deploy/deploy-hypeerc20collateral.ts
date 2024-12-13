import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Get the deployed ERC20 token address
  const myERC20 = await deployments.get('MyERC20');
  
  // Arbitrum Sepolia Hyperlane Mailbox address
  const MAILBOX_ADDRESS = '0x3C5154a193D6e2955650f9305c8d80c18C814A68';

  await deploy('MyCustomHypERC20Collateral', {
    from: deployer,
    args: [myERC20.address, MAILBOX_ADDRESS],
    log: true,
    waitConfirmations: 1,
  });
};

func.tags = ['HypeERC20Collateral'];
// Make sure MyERC20 is deployed first
func.dependencies = ['MyERC20'];
export default func;
