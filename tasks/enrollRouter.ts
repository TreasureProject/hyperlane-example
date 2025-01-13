import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERLANE_CONFIG } from "../config";
import { task } from "hardhat/config";
import { TokenRouter } from "@hyperlane-xyz/core";

task("enroll-routers", "Enrolls remote routers for contracts")
    .addOptionalParam("contract", "Name of specific contract to enroll")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers, deployments } = hre;
        const [signer] = await ethers.getSigners();

        // Get current network's chainId
        const currentChainId = network.config.chainId;
        if (!currentChainId) {
            throw new Error("ChainId must be defined in network config");
        }

        // Validate contract parameter if provided
        if (taskArgs.contract) {
            if (!HYPERLANE_CONFIG.deployments[taskArgs.contract]) {
                throw new Error(`Contract ${taskArgs.contract} not found in deployments config`);
            }
            if (!HYPERLANE_CONFIG.relationships[taskArgs.contract]) {
                throw new Error(`Contract ${taskArgs.contract} has no relationships defined`);
            }
        }

        // Filter contracts based on optional parameter
        const contractsToProcess = taskArgs.contract
            ? [[taskArgs.contract, HYPERLANE_CONFIG.deployments[taskArgs.contract]]]
            : Object.entries(HYPERLANE_CONFIG.deployments);

        // Iterate through filtered contracts
        for (const [contractName, contractDeployments] of contractsToProcess) {
            console.log(`Processing ${contractName}...`);

            const currentDeployment = contractDeployments[network.name];
            if (!currentDeployment) {
                console.log(`No deployment found for ${contractName} on ${network.name}`);
                continue;
            }

            const deployment = await deployments.get(contractName);
            const contract = await ethers.getContractAt(contractName, deployment.address, signer);

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

                if (destDeployment.hook) {
                    const hookTx = await contract.setHook(destDeployment.hook);
                    await hookTx.wait(2);
                    console.log(`Hook set for ${destinationNetwork}`);
                }

                if (destDeployment.ism) {
                    const ismTx = await contract.setInterchainSecurityModule(destDeployment.ism);
                    await ismTx.wait(2);
                    console.log(`ISM set for ${destinationNetwork}`);
                }

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
    });
