import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const NFT_CONFIG = {
    name: "MyNFT",
    symbol: "MNFT",
    baseURI: "ipfs://QmYourBaseURIHash/",
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [NFT_CONFIG.name, NFT_CONFIG.symbol, NFT_CONFIG.baseURI];

    await deploy(NFT_CONFIG.name, {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: 1,
    });
};

func.tags = [NFT_CONFIG.name];
func.dependencies = [];

module.exports = func;
