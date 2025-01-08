import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERLANE_CONFIG } from "../config";
import { task } from "hardhat/config";

task("enroll-routers", "Enrolls remote routers for contracts").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers, deployments } = hre;
        const [signer] = await ethers.getSigners();

        // Get current network's chainId
        const currentChainId = network.config.chainId;
        if (!currentChainId) {
            throw new Error("ChainId must be defined in network config");
        }

        // Iterate through each contract in deployments
        for (const [contractName, contractDeployments] of Object.entries(
            HYPERLANE_CONFIG.deployments,
        )) {
            console.log(`Processing ${contractName}...`);

            // Check if contract is deployed on current network
            const currentDeployment = contractDeployments[network.name];
            if (!currentDeployment) {
                console.log(`No deployment found for ${contractName} on ${network.name}`);
                continue;
            }

            // Get contract instance
            const deployment = await deployments.get(contractName);
            const contract = await ethers.getContractAt(contractName, deployment.address, signer);

            // Get relationships where current network is the source
            const relationships = HYPERLANE_CONFIG.relationships[contractName] || [];
            const relevantRelationships = relationships.filter(
                ([source]) => source === network.name,
            );

            for (const [_, destinationNetwork] of relevantRelationships) {
                const destNetworkConfig = HYPERLANE_CONFIG.networks[destinationNetwork];
                const destDeployment = contractDeployments[destinationNetwork];

                if (!destNetworkConfig || !destDeployment) {
                    console.log(`Missing configuration for ${destinationNetwork}`);
                    continue;
                }

                // Set gas config if specified
                if (destNetworkConfig.gasAmount) {
                    const gasConfig = [
                        {
                            domain: destNetworkConfig.chainId,
                            gas: destNetworkConfig.gasAmount,
                        },
                    ];

                    const gasConfigTx = await contract.setDestinationGas(gasConfig);
                    await gasConfigTx.wait(1);
                    console.log(`Gas config set for ${destinationNetwork}`);
                }

                // Set hook if specified
                if (destDeployment.hook) {
                    const hookTx = await contract.setHook(destDeployment.hook);
                    await hookTx.wait(2);
                    console.log(`Hook set for ${destinationNetwork}`);
                }

                // Set ISM if specified
                if (destDeployment.ism) {
                    const ismTx = await contract.setInterchainSecurityModule(destDeployment.ism);
                    await ismTx.wait(2);
                    console.log(`ISM set for ${destinationNetwork}`);
                }

                // Enroll remote router
                const enroll = await contract.enrollRemoteRouter(
                    destNetworkConfig.chainId,
                    ethers.zeroPadValue(destDeployment.address, 32),
                );
                await enroll.wait(1);
                console.log(
                    `Enrolled ${contractName} from ${network.name} to ${destinationNetwork}`,
                );
            }
        }
    },
);
