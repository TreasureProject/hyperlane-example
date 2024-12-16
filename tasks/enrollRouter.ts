import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("enroll-routers", "Enrolls remote routers for HypERC20 token")
    .addParam("token", "Token Name")
    .setAction(async (taskArgs: { token: string }, hre: HardhatRuntimeEnvironment) => {
        const { deployments, network } = hre;

        const tokenDeployment = await deployments.get(taskArgs.token);
        const deploymentInfo = await deployments.get(`${taskArgs.token}-hlinfo`);

        if (!deploymentInfo.peers || deploymentInfo.peers.length === 0) {
            console.log("No peers to enroll for", network.name);
            return;
        }

        const token = await hre.ethers.getContractAt(taskArgs.token, tokenDeployment.address);

        for (const peer of deploymentInfo.peers) {
            try {
                const peerDeployment = await deployments.get(`-${peer.name}`);

                await token.enrollRemoteRouter(peer.chainId, peerDeployment.address);

                console.log(`Enrolled ${peer.name} router for ${network.name} token`);
            } catch (error) {
                console.warn(
                    `Warning: Could not enroll peer ${peer.name}. Has it been deployed yet?`,
                );
            }
        }
    });
