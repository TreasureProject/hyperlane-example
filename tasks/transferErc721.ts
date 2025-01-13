import { task } from "hardhat/config";

task("transfer-nft", "Transfer NFT across chains")
    .addParam("dest", "Destination domain")
    .addParam("recipient", "Recipient address")
    .addParam("tokenId", "NFT token ID to transfer")
    .setAction(async (taskArgs, { ethers, deployments }) => {
        const [signer] = await ethers.getSigners();

        if (!ethers.isAddress(taskArgs.recipient)) {
            throw new Error("Invalid recipient address");
        }

        try {
            const collateralToken = await deployments.get("HypErc721Collateral");
            const collateralContract = await ethers.getContractAt(
                "HypErc721Collateral",
                collateralToken.address,
                signer,
            );

            const wrappedTokenAddress = await collateralContract.wrappedToken();
            const nftContract = await ethers.getContractAt(
                "HyperC721",
                wrappedTokenAddress,
                signer,
            );

            // Approve NFT transfer
            const approveTx = await nftContract.approve(collateralToken.address, taskArgs.tokenId);
            await approveTx.wait(2);
            console.log("NFT approval confirmed");

            // Get gas quote for the destination chain
            const quote = await collateralContract.quoteGasPayment(parseInt(taskArgs.dest));
            if (quote === 0n) {
                throw new Error("Invalid gas quote received");
            }

            // Transfer NFT to destination chain
            const tx = await collateralContract.transferRemote(
                parseInt(taskArgs.dest),
                ethers.zeroPadValue(taskArgs.recipient, 32),
                taskArgs.tokenId,
                "0x",
                ethers.ZeroAddress,
                {
                    value: quote,
                },
            );

            await tx.wait(1);
            console.log(
                `Transferred NFT #${taskArgs.tokenId} to ${taskArgs.recipient} on domain ${taskArgs.dest}`,
            );
        } catch (error) {
            console.error("NFT transfer failed:", error);
            throw error;
        }
    });
