import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERCHAIN_CONFIG } from "../config";
import { TokenRouter__factory } from "../typechain-types";

task("enroll-routers", "Enrolls remote routers for token").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers } = hre;
        const [signer] = await ethers.getSigners();

        const routerConfigs = HYPERCHAIN_CONFIG.routers;

        for (const routerConfig of routerConfigs) {
            // Find the address for the current network
            const srcAddr = routerConfig.addresses[network.name];
            if (!srcAddr) continue;

            const token = TokenRouter__factory.connect(srcAddr, signer);

            // Get the peers for this network
            const peerNetworks = routerConfig.peerMap[network.name];

            if (peerNetworks.length === 0) {
                throw new Error("Peers must be specified for enrollment");
            }

            console.log(`Enrolling router for ${routerConfig.contract}`);

            for (const peerNetwork of peerNetworks) {
                const peerAddr = routerConfig.addresses[peerNetwork];
                const peerChainId = HYPERCHAIN_CONFIG.chains[peerNetwork].id;

                if (!peerAddr) {
                    throw new Error("No peer addresses found, please add them to the config");
                }

                const enroll = await token.enrollRemoteRouter(
                    peerChainId,
                    ethers.zeroPadValue(peerAddr, 32),
                );
                await enroll.wait(3);
                console.log(`${peerNetwork} router enrolled`);
            }
        }
    },
);
