import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const NFT_CONFIG = {
    name: "MyERC721",
    symbol: "MNFT",
    baseURI: "ipfs://QmYourBaseURIHash/",
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const contract = await deploy(NFT_CONFIG.name, {
        from: deployer,
        args: [NFT_CONFIG.name, NFT_CONFIG.symbol, NFT_CONFIG.baseURI],
        log: true,
        waitConfirmations: 1,
    });
};

func.tags = [NFT_CONFIG.name];
func.dependencies = [];

module.exports = func;
