import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const TOKEN_CONFIG = {
    name: "MyCustomHypERC20",
    symbol: "GLT",
    decimals: 18,
    totalSupply: "1000000000000000000000000", // 1 million
} as const;

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const result = await deploy(TOKEN_CONFIG.name, {
        from: deployer,
        args: [TOKEN_CONFIG.decimals, network.config.lzMailbox],
        log: true,
        waitConfirmations: 2,
    });

    const token = await hre.ethers.getContractAt(TOKEN_CONFIG.name, result.address);

    if (result.newlyDeployed) {
        console.log("new deploy, init token");
        await token.initialize(
            TOKEN_CONFIG.totalSupply,
            TOKEN_CONFIG.name,
            TOKEN_CONFIG.symbol,
            igp,
            ism,
            deployer,
        );

        console.log("setting gas configs");

        const gasConfigs = Object.entries(networkConfig.gasConfig.destinationGas).map(
            ([domain, gas]) => ({
                domain: parseInt(domain),
                gas,
            }),
        );

        //@ts-expect-error package types defective
        await token.setDestinationGas(gasConfigs);

        console.log("destination gas set");
    }
};

func.tags = ["HypERC20"];
func.dependencies = [];

export default func;
