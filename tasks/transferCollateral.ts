import { task } from "hardhat/config";
import { HypERC1155Collateral__factory, IERC1155__factory } from "../typechain-types";

task("transfer-1155-collateral", "Transfer wrapped ERC1155 tokens across chains")
    .addParam("dest", "Destination domain")
    .addParam("recipient", "Recipient address")
    .addParam("tokenid", "Token ID to transfer")
    .addParam("amt", "Amount to transfer")
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const [signer] = await ethers.getSigners();
        const deployment = await deployments.get("HypERC1155Collateral");
        const tokenContract = HypERC1155Collateral__factory.connect(deployment.address, signer);

        const wrappedTokenAddress = await tokenContract.wrappedToken();
        const wrappedToken = IERC1155__factory.connect(wrappedTokenAddress, signer);

        const isApproved = await wrappedToken.isApprovedForAll(signer.address, deployment.address);
        if (!isApproved) {
            const approveTx = await wrappedToken.setApprovalForAll(deployment.address, true);
            await approveTx.wait();
            console.log("Approved HypERC1155Collateral contract for all tokens");
        }

        const quote = await tokenContract.quoteGasPayment(parseInt(taskArgs.dest));

        const packedValue = (BigInt(taskArgs.tokenid) << 128n) | BigInt(taskArgs.amt);

        //@ts-expect-error types wrong
        const tx = await tokenContract.transferRemote(
            parseInt(taskArgs.dest),
            ethers.zeroPadValue(taskArgs.recipient, 32),
            packedValue,
            "0x", // empty hook metadata
            ethers.ZeroAddress, // default
            { value: quote },
        );
        await tx.wait();
        console.log(
            `Transferred ${taskArgs.amt} of token ID ${taskArgs.tokenid} to ${taskArgs.recipient}`,
        );
    });
