import * as hre from "hardhat";

export default async function () {
    const mainContract = await hre.ethers.deployContract("HypERC1155");
    await mainContract.waitForDeployment();
    console.log("Main contract deployed to:", mainContract.target);
}
