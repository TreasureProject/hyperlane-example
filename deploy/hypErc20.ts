import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

const TOKEN_CONFIG = {
    name: "MyCustomHypERC20",
    symbol: "GLT",
    decimals: 18,
    totalSupply: "1000000000000000000000000", // 1 million tokens with 18 decimals
    hook: ethers.ZeroAddress,
    interchainSecurityModule: ethers.ZeroAddress,
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy(TOKEN_CONFIG.name, {
        from: deployer,
        args: [TOKEN_CONFIG.decimals, network.config.lzMailbox],
        log: true,
        waitConfirmations: 2,
    });

    const HypERC20 = await hre.ethers.getContractAt(TOKEN_CONFIG.name, deployment.address);

    await HypERC20.initialize(
        TOKEN_CONFIG.totalSupply,
        TOKEN_CONFIG.name,
        TOKEN_CONFIG.symbol,
        TOKEN_CONFIG.hook,
        TOKEN_CONFIG.interchainSecurityModule,
        deployer,
    );

    console.log(`Deployed and initialized ${TOKEN_CONFIG.name} at:`, deployment.address);
};

func.tags = [TOKEN_CONFIG.name];
func.dependencies = [];

export default func;
