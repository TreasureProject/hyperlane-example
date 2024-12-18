// interface HLConfig {
//     srcChain: string;
//     pairing: {
//         contract: string;
//         peers: {
//             contractName: string;
//             destChain: string;
//         }[];
//     }[];
//     gasConfig: {
//         destinationGas: {
//             [domain: number]: number;
//         };
//     };
//     // Optional overrides
//     customIsm?: string;
//     customIgp?: string;
// }
//

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { TOKEN_MAPPING } from "../config";
import { TokenRouter__factory } from "../typechain-types";

task("enroll-routers", "Enrolls remote routers for token").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers } = hre;
        const [signer] = await ethers.getSigners();

        const networkConfig = TOKEN_MAPPING.find((n) => n.srcChain === network.name);
        if (!networkConfig) {
            throw new Error(`No config found for ${network.name}`);
        }

        if (!network.config.lzMailbox) {
            throw new Error("lzMailbox must be defined for the network");
        }

        for (const { srcAddr, peers } of networkConfig.pairing) {
            const token = TokenRouter__factory.connect(srcAddr, signer);

            console.log("enrolling router");
            for (const peer of peers) {
                console.log(peer);
                const enroll = await token.enrollRemoteRouter(
                    peer.chainId,
                    ethers.zeroPadValue(peer.destAddr, 32),
                );
                await enroll.wait(3);
                console.log(peer.contract, "enrolled");
            }
        }
    },
);
