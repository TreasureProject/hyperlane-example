import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { NETWORK_CONFIG, TOKEN_CONFIG } from "../config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const networkConfig = NETWORK_CONFIG.find((n) => n.name === network.name);
    if (!networkConfig) {
        throw new Error(`No config found for ${network.name}`);
    }

    const mailbox = await hre.ethers.getContractAt("IMailbox", networkConfig.mailbox);
    const ism = networkConfig.customIsm || (await mailbox.defaultIsm());
    const igp = networkConfig.customIgp || (await mailbox.defaultHook());

    const result = await deploy("HypERC20", {
        from: deployer,
        args: [TOKEN_CONFIG.decimals, networkConfig.mailbox],
        log: true,
        waitConfirmations: 2,
    });

    const token = await hre.ethers.getContractAt("HypERC20", result.address);

    if (result.newlyDeployed) {
        await token.initialize(
            TOKEN_CONFIG.totalSupply,
            TOKEN_CONFIG.name,
            TOKEN_CONFIG.symbol,
            igp,
            ism,
            deployer,
        );

        const gasConfigs = Object.entries(networkConfig.gasConfig.destinationGas).map(
            ([domain, gas]) => ({
                domain: parseInt(domain),
                gas,
            }),
        );
        await token.setDestinationGas(gasConfigs);

        console.log(
            "Save result:",
            await deployments.save(`${TOKEN_CONFIG.name}-hlinfo`, {
                abi: result.abi,
                address: result.address,
                peers: networkConfig.peers,
            }),
        );
    }
};

func.tags = ["HypERC20"];
func.dependencies = [];

export default func;
