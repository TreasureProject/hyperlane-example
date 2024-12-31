import { task } from "hardhat/config";

task("transfer-1155", "Transfer ERC1155 tokens across chains")
    .addParam("dest", "Destination domain")
    .addParam("recipient", "Recipient address")
    .addParam("tokenid", "Token ID to transfer")
    .addParam("amt", "Amount to transfer")
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const [signer] = await ethers.getSigners();

        const HypERC1155 = await deployments.get("HypERC1155");
        const tokenContract = await ethers.getContractAt("TokenRouter", HypERC1155.address, signer);

        const quote = await tokenContract.quoteGasPayment(parseInt(taskArgs.dest));

        // Pack tokenId and amount using contract's _packValues method
        const packedValue = (BigInt(taskArgs.tokenid) << 128n) | BigInt(taskArgs.amt);

        //@ts-expect-error package types wrong
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
