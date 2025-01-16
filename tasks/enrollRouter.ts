import { task } from "hardhat/config";
import { hyperlaneConfig } from "../hyperlane.config";

task("enroll-routers", "Enrolls remote routers for current network").setAction(async (_, hre) => {
    const { ethers, config, network } = hre;
    const [signer] = await ethers.getSigners();
    const currentNetwork = network.name;

    const { networks } = hyperlaneConfig[0];
    if (!networks[currentNetwork]) return;

    console.log("Enrollment Starting...");

    const sourceSettings = networks[currentNetwork];
    const sourceContract = await ethers.getContractAt(
        sourceSettings.contractName,
        (await require(`../deployments/${currentNetwork}/${sourceSettings.contractName}.json`))
            .address,
        signer,
    );

    for (const [destNetwork, destSettings] of Object.entries(networks)) {
        if (destNetwork === currentNetwork) continue;

        try {
            const destAddress = (
                await require(`../deployments/${destNetwork}/${destSettings.contractName}.json`)
            ).address;

            if (config.networks[destNetwork].chainId === undefined) {
                throw new Error("Chain Id required");
            }

            const destDomain = config.networks[destNetwork].chainId.toString();

            if (sourceSettings.gas) {
                const gasTx = await sourceContract.setDestinationGas([
                    { domain: destDomain, gas: sourceSettings.gas },
                ]);
                await gasTx.wait(2);
            }
            const enrollTx = await sourceContract.enrollRemoteRouter(
                destDomain,
                ethers.zeroPadValue(destAddress, 32),
            );
            await enrollTx.wait(2);
            console.log(`✓ Enrolled router for ${destNetwork}`);
        } catch (error) {
            console.error(`✗ Failed to enroll router for ${destNetwork}:`, error);
        }
    }
});
