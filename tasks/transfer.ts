import { task } from "hardhat/config";
import { HypERC20__factory } from "../typechain-types";
task("transfer", "Transfer tokens across chains")
    .addParam("destination", "Destination domain")
    .addParam("recipient", "Recipient address")
    .addParam("amount", "Amount to transfer")
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const [signer] = await ethers.getSigners();
        const deployment = await deployments.get("MyCustomHypERC20");
        const tokenContract = HypERC20__factory.connect(deployment.address, signer);
        //
        // console.log(`adding ${taskArgs.amount} to approval limit from underlying token`);
        //
        // const wrappedToken = await tokenContract.wrappedToken();
        // const wrappedTokenInstance = (await ethers.getContractAt("IERC20", wrappedToken)) as IERC20;
        //

        //        const approvalTx = await wrappedTokenInstance.approve(deployment.address, amt);

        //        approvalTx.wait(1);

        const quote = await tokenContract.quoteGasPayment(parseInt(taskArgs.destination));

        const tx = await tokenContract.transferRemote(
            parseInt(taskArgs.destination),
            ethers.zeroPadValue(taskArgs.recipient, 32),
            ethers.parseUnits(taskArgs.amount, 18),
            { value: quote },
        );
        await tx.wait();
        console.log(`Transferred ${taskArgs.amount} tokens to ${taskArgs.recipient}`);
    });
