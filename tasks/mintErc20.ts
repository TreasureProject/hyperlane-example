import { task } from "hardhat/config";

task("mint", "Mints tokens to a specified address")
    .addParam("address", "The address to mint tokens to")
    .addParam("amount", "Amount of tokens to mint, in wei")
    .setAction(async (taskArgs, hre) => {
        // Get the contract factory using ethers.js v6
        const deployment = await hre.deployments.get("MyERC20");
        // Use getContractAt to connect to an existing contract
        const myERC20 = await hre.ethers.getContractAt("MyERC20", deployment.address); // Replace with your deployed contract's address

        // Convert amount to BigInt for v6 compatibility
        const amount = hre.ethers.parseEther(taskArgs.amount);

        // Call the mint function
        const tx = await myERC20.mint(taskArgs.address, amount);

        console.log("Minting transaction hash:", tx.hash);
        await tx.wait();
        console.log("Tokens minted successfully!");
    });
