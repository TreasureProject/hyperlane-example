import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const TOKEN_CONFIG = {
    name: "MyERC20",
    symbol: "MER",
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy(TOKEN_CONFIG.name, {
        from: deployer,
        args: [TOKEN_CONFIG.name, TOKEN_CONFIG.symbol],
        log: true,
        waitConfirmations: 1,
    });
};

export default func;
func.tags = [TOKEN_CONFIG.name];
