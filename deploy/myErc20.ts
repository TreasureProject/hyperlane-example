import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const name = "My Token";
  const symbol = "MTK";

  await deploy('MyERC20', {
    from: deployer,
    args: [name, symbol],
    log: true,
    waitConfirmations: 1,
  });
};

func.tags = ['MyERC20'];
export default func;
