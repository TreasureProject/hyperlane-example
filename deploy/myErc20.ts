import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const TOKEN_CONFIG = {
    name: "MyToken",
    symbol: "MTK",
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [TOKEN_CONFIG.name, TOKEN_CONFIG.symbol];

    await deploy("MyERC20", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
};

export default func;
func.tags = [TOKEN_CONFIG.name];
