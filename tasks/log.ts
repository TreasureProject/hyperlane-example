import { task } from "hardhat/config";

task("log", "logs").setAction(async (_, hre) => {
    const { deployments } = hre;

    console.log(JSON.stringify(deployments.get("HypERC20"), null, 2));
    const deploymentJson = await deployments.getExtendedArtifact("HypERC20");
    console.log(JSON.stringify(deploymentJson.deployedBytecodes, null, 2));
});
