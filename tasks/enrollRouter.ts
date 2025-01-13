import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HYPERLANE_CONFIG } from "../config";
import { task } from "hardhat/config";

task("enroll-routers", "Enrolls remote routers for contracts")
    .addOptionalParam("contract", "Name of specific contract to enroll")
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { network, ethers, deployments } = hre;
        const [signer] = await ethers.getSigners();

        if (!network.config.chainId) {
            throw new Error("ChainId must be defined in network config");
        }

        const contractsToProcess = taskArgs.contract
            ? [[taskArgs.contract, HYPERLANE_CONFIG.deployments[taskArgs.contract]]]
            : Object.entries(HYPERLANE_CONFIG.deployments).filter(
                  ([_, deployments]) => deployments[network.name] !== undefined,
              );

        for (const [contractName, contractDeployments] of contractsToProcess) {
            console.log(`Processing ${contractName}...`);

            const currentDeployment = contractDeployments[network.name];
            if (!currentDeployment) {
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
                if (!destNetworkConfig) {
                    throw new Error(`Missing network configuration for ${destinationNetwork}`);
                }

                try {
                    if (destNetworkConfig.gasAmount) {
                        const gasConfig = [
                            {
                                domain: destNetworkConfig.chainId,
                                gas: destNetworkConfig.gasAmount,
                            },
                        ];
                        //@ts-expect-error
                        const gasConfigTx = await contract.setDestinationGas(gasConfig);
                        await gasConfigTx.wait(1);
                        console.log(`Gas config set for ${destinationNetwork}`);
                    }

                    // Find the corresponding contract for the destination
                    const destinationContractName = Object.keys(HYPERLANE_CONFIG.deployments).find(
                        (name) => HYPERLANE_CONFIG.deployments[name][destinationNetwork],
                    );

                    if (!destinationContractName) {
                        throw new Error(`No contract found for ${destinationNetwork}`);
                    }

                    const destinationDeployment =
                        HYPERLANE_CONFIG.deployments[destinationContractName][destinationNetwork];

                    const enroll = await contract.enrollRemoteRouter(
                        destNetworkConfig.chainId,
                        ethers.zeroPadValue(destinationDeployment.address, 32),
                    );
                    await enroll.wait(1);
                    console.log(
                        `Enrolled ${contractName} from ${network.name} to ${destinationNetwork}`,
                    );
                } catch (error) {
                    console.error(`Failed to enroll router: ${error}`);
                    throw error;
                }
            }
        }
    });
