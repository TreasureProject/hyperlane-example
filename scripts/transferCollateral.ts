import { ethers, deployments } from "hardhat";
import { HypERC1155Collateral__factory, IERC1155__factory } from "../typechain-types";

async function main() {
    const dest = process.argv[2];
    const recipient = process.argv[3];
    const tokenId = process.argv[4];
    const amount = process.argv[5];

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

    const quote = await tokenContract.quoteGasPayment(parseInt(dest));
    const packedValue = (BigInt(tokenId) << 128n) | BigInt(amount);

    const tx = await tokenContract.transferRemote(
        parseInt(dest),
        ethers.zeroPadValue(recipient, 32),
        packedValue,
        "0x",
        ethers.ZeroAddress,
        { value: quote },
    );
    await tx.wait();
    console.log(`Transferred ${amount} of token ID ${tokenId} to ${recipient}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
