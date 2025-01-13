import { parseUnits } from "ethers";
import { task } from "hardhat/config";

task("transfer-erc20", "Transfer ERC20 tokens across chains")
    .addParam("dest", "Destination domain")
    .addParam("recipient", "Recipient address")
    .addParam("amount", "Amount to transfer")
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const [signer] = await ethers.getSigners();

        if (!ethers.isAddress(taskArgs.recipient)) {
            throw new Error("Invalid recipient address");
        }

        try {
            const collateralToken = await deployments.get("MyCustomHypERC20Collateral");
            const collateralContract = await ethers.getContractAt(
                "MyCustomHypERC20Collateral",
                collateralToken.address,
                signer,
            );

            const wrappedTokenAddress = await collateralContract.wrappedToken();
            const erc20Contract = await ethers.getContractAt(
                "IERC20Metadata",
                wrappedTokenAddress,
                signer,
            );

            const decimals = await erc20Contract.decimals();
            console.log(`Token decimals: ${decimals}`);
            const parsedAmount = parseUnits(taskArgs.amount, decimals);
            console.log(`Parsed amount: ${parsedAmount.toString()}`);

            const approveTx = await erc20Contract.approve(collateralToken.address, parsedAmount);
            await approveTx.wait(2);
            console.log("Approval confirmed");

            const quote = await collateralContract.quoteGasPayment(parseInt(taskArgs.dest));
            if (quote === 0n) {
                throw new Error("Invalid gas quote received");
            }

            //@ts-expect-error
            const tx = await collateralContract.transferRemote(
                parseInt(taskArgs.dest),
                ethers.zeroPadValue(taskArgs.recipient, 32),
                parsedAmount,
                "0x",
                ethers.ZeroAddress,
                {
                    value: quote,
                },
            );

            await tx.wait(1);
            console.log(
                `Transferred ${taskArgs.amount} tokens to ${taskArgs.recipient} on domain ${taskArgs.dest}`,
            );
        } catch (error) {
            console.error("Transfer failed:", error);
            throw error;
        }
    });
