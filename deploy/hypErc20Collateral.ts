import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

const TOKEN_CONFIG = {
    name: "MyCustomHypERC20Collateral",
    existingToken: "0x8046810E0fC22D32451DE74a0B2C69bb2408EBf5", // Replace with actual token address
    hook: ethers.ZeroAddress,
    interchainSecurityModule: ethers.ZeroAddress,
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy(TOKEN_CONFIG.name, {
        from: deployer,
        args: [TOKEN_CONFIG.existingToken, network.config.lzMailbox],
        log: true,
        waitConfirmations: 1,
    });

    const HypERC20Collateral = await hre.ethers.getContractAt(
        TOKEN_CONFIG.name,
        deployment.address,
    );

    await HypERC20Collateral.initialize(
        TOKEN_CONFIG.hook,
        TOKEN_CONFIG.interchainSecurityModule,
        deployer,
    );

    console.log(`Deployed and initialized ${TOKEN_CONFIG.name} at:`, deployment.address);
};

func.tags = [TOKEN_CONFIG.name];
export default func;
