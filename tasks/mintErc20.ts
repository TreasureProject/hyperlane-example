import { task } from "hardhat/config";

task("mint-erc20", "Mints tokens to a specified address")
    .addParam("to", "Address to mint tokens to")
    .addParam("amount", "Amount of tokens to mint (in whole tokens)")
    .setAction(async (taskArgs, hre) => {
        const { to, amount } = taskArgs;

        const myToken = await hre.deployments.get("MyERC20");
        const tokenContract = await hre.ethers.getContractAt("MyERC20", myToken.address);

        const decimals = await tokenContract.decimals();

        const mintAmount = hre.ethers.parseUnits(amount, decimals);

        const tx = await tokenContract.mint(to, mintAmount);
        await tx.wait();

        console.log(`Minted ${amount} tokens to ${to}`);

        // Get balance after minting (formatted with proper decimals)
        const balance = await tokenContract.balanceOf(to);
        const formattedBalance = hre.ethers.formatUnits(balance, decimals);
        console.log(`New balance: ${formattedBalance}`);
    });
