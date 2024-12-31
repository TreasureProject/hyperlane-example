import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERLANE_CONFIG } from "../config";

task("enroll-routers", "Enrolls remote routers for token").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers, config, deployments } = hre;
        const [signer] = await ethers.getSigners();

        const peerConfig = HYPERLANE_CONFIG.routers.find((conf) => conf.networks[network.name]);

        const chainId = config.networks[network.name].chainId;

        if (!chainId) {
            throw new Error("ChainId must be defined in config");
        }

        const gasConfigs = HYPERLANE_CONFIG.gasConfig[chainId] || {};
        const routerGasConfigs = Object.entries(gasConfigs).map(([destChainId, gasAmount]) => ({
            domain: parseInt(destChainId),
            gas: gasAmount,
        }));

        if (!peerConfig) {
            throw new Error("Config not found for specified network");
        }

        const address = peerConfig["networks"][network.name].address;
        const peers = peerConfig["networks"][network.name].peers;

        const deployment = await deployments.get("TokenRouter");
        const token = await ethers.getContractAt("TokenRouter", deployment.address, signer);

        console.log(address);
        for (const { networkName, ism, hook, address } of peers) {
            if (routerGasConfigs.length > 0) {
                const gasConfigTx = await token.setDestinationGas(routerGasConfigs);
                await gasConfigTx.wait(1);
                console.log("Gas configs set");
            }

            if (hook) {
                console.log("setting hook");
                const hookTx = await token.setHook(hook);
                await hookTx.wait(2);
            }

            if (ism) {
                console.log("setting ISM");
                const ismTx = await token.setInterchainSecurityModule(ism);
                await ismTx.wait(2);
            }

            const peerChainId = config.networks[networkName].chainId;

            if (!peerChainId) {
                throw new Error("peer chain id must be defined");
            }

            const enroll = await token.enrollRemoteRouter(
                peerChainId,
                ethers.zeroPadValue(address, 32),
            );

            await enroll.wait(1);
            console.log("enrolled");
        }
    },
);
