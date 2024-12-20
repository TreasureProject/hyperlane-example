import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERLANE_CONFIG } from "../config";
import { TokenRouter__factory } from "../typechain-types";

task("enroll-routers", "Enrolls remote routers for token").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers } = hre;
        const [signer] = await ethers.getSigners();

        for (const routerConfig of HYPERLANE_CONFIG.routers) {
            const currentNetwork = routerConfig.networks[network.name];
            if (!currentNetwork) {
                throw new Error("network name not found in config");
            }

            const token = TokenRouter__factory.connect(currentNetwork.address, signer);

            for (const peer of currentNetwork.peers) {
                const peerChainId = hre.network.config.chainId;

                if (!peerChainId) {
                    throw new Error(`No chain ID found for ${peer.networkName}`);
                }

                if (peer.hook) {
                    await token.setHook(peer.hook);
                }

                if (peer.ism) {
                    await token.setInterchainSecurityModule(peer.ism);
                }

                const enroll = await token.enrollRemoteRouter(
                    peerChainId,
                    ethers.zeroPadValue(peer.address, 32),
                );
                await enroll.wait(2);
                console.log(`${peer.networkName} router enrolled`);
            }
        }
    },
);
