import { ethers, config, network } from "hardhat";
import { HYPERLANE_CONFIG } from "../config";
import { TokenRouter__factory } from "../typechain-types";

async function main() {
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
    const token = TokenRouter__factory.connect(address, signer);

    for (const { networkName, ism, hook, address } of peers) {
        if (routerGasConfigs.length > 0) {
            //@ts-expect-error types wrong
            const gasConfigTx = await token.setDestinationGas(routerGasConfigs);
            await gasConfigTx.wait(1);
            console.log("Gas configs set");
        }

        if (hook) {
            console.log("setting hook");
            const hookTx = await token.setHook(hook);
            hookTx.wait(2);
        }

        if (ism) {
            console.log("setting ISM");
            const ismTx = await token.setInterchainSecurityModule(ism);
            ismTx.wait(2);
        }

        const peerChainId = config.networks[networkName].chainId;

        if (!peerChainId) {
            throw new Error("peer chain id must be defined");
        }

        const enroll = await token.enrollRemoteRouter(
            peerChainId,
            ethers.zeroPadValue(address, 32),
        );

        enroll.wait(1);
        console.log("enrolled");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
