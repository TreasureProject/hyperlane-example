import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

const NFT_CONFIG = {
    name: "MyCustomHypERC721",
    symbol: "HNFT",
    hook: ethers.ZeroAddress,
    interchainSecurityModule: ethers.ZeroAddress,
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployment = await deploy(NFT_CONFIG.name, {
        from: deployer,
        args: [network.config.lzMailbox],
        log: true,
        waitConfirmations: 2,
    });

    const HypERC721 = await hre.ethers.getContractAt(NFT_CONFIG.name, deployment.address);

    await HypERC721.initialize(
        0,
        NFT_CONFIG.name,
        NFT_CONFIG.symbol,
        NFT_CONFIG.hook,
        NFT_CONFIG.interchainSecurityModule,
        deployer,
    );

    console.log(`Deployed and initialized ${NFT_CONFIG.name} at:`, deployment.address);
};

func.tags = [NFT_CONFIG.name];
func.dependencies = [];

export default func;
