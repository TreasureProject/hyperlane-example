import { ethers, deployments } from "hardhat";
import { TokenRouter__factory } from "../typechain-types";

async function main() {
    // Get command line arguments
    const [, , dest, recipient, tokenId, amount] = process.argv;

    // Validate required arguments
    if (!dest || !recipient || !tokenId || !amount) {
        console.error("Missing required arguments");
        console.log(
            "Usage: npx hardhat run scripts/transfer1155.ts --network <network> <dest> <recipient> <tokenId> <amount>",
        );
        process.exit(1);
    }

    try {
        const [signer] = await ethers.getSigners();
        const deployment = await deployments.get("HypERC1155");
        const tokenContract = TokenRouter__factory.connect(deployment.address, signer);

        // Get gas quote for the transfer
        const quote = await tokenContract.quoteGasPayment(parseInt(dest));

        // Pack tokenId and amount using contract's _packValues method
        const packedValue = (BigInt(tokenId) << 128n) | BigInt(amount);

        //@ts-expect-error package types wrong
        const tx = await tokenContract.transferRemote(
            parseInt(dest),
            ethers.zeroPadValue(recipient, 32),
            packedValue,
            "0x", // empty hook metadata
            ethers.ZeroAddress, // default
            { value: quote },
        );

        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log(`Transferred ${amount} of token ID ${tokenId} to ${recipient}`);
    } catch (error) {
        console.error("Error executing transfer:", error);
        process.exit(1);
    }
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
