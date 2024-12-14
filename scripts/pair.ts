import "dotenv/config";
import { ethers } from "ethers";
import { deployments } from "hardhat";

const { ARBSEP_RPC_URL, SEP_RPC_URL, PRIVATE_KEY } = process.env;

if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY missing");
}
const privateKey = PRIVATE_KEY as string;

const TOKEN_ROUTER_ABI = [
    "function enrollRemoteRouter(uint32 _domain, bytes32 _router) external",
    "function localDomain() external view returns (uint32)",
];

async function setupChainPairing() {
    // Get deployed token addresses from deployments
    const originDeployment = await deployments.get("MyCustomHypERC20Collateral");
    const originRouter = originDeployment.address;

    // For destination chain deployment, you'll need to read from the deployments directory
    const fs = require("fs");
    const destDeploymentPath = `deployments/sepolia/MyCustomHypERC20Collateral.json`;
    const destDeployment = JSON.parse(fs.readFileSync(destDeploymentPath, "utf8"));
    const destRouter = destDeployment.address;

    console.log("Found deployed routers:");
    console.log("Origin:", originRouter);
    console.log("Destination:", destRouter);

    const config = {
        originChain: {
            rpc: ARBSEP_RPC_URL,
            domain: 421614,
            mailbox: "0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8",
        },
        destinationChain: {
            rpc: SEP_RPC_URL,
            domain: 11155111,
            mailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766",
        },
    };

    const originProvider = new ethers.JsonRpcProvider(config.originChain.rpc);
    const destProvider = new ethers.JsonRpcProvider(config.destinationChain.rpc);

    const originSigner = new ethers.Wallet(privateKey, originProvider);
    const destSigner = new ethers.Wallet(privateKey, destProvider);

    // Get router contracts
    const originRouterContract = new ethers.Contract(originRouter, TOKEN_ROUTER_ABI, originSigner);
    const destRouterContract = new ethers.Contract(destRouter, TOKEN_ROUTER_ABI, destSigner);

    // Convert addresses to bytes32
    const originRouterBytes32 = ethers.zeroPadValue(originRouter, 32);
    const destRouterBytes32 = ethers.zeroPadValue(destRouter, 32);

    console.log("Setting up router pairing...");

    // Enroll routers
    const tx1 = await originRouterContract.enrollRemoteRouter(
        config.destinationChain.domain,
        destRouterBytes32,
    );
    await tx1.wait();
    console.log("Origin router enrolled destination");

    const tx2 = await destRouterContract.enrollRemoteRouter(
        config.originChain.domain,
        originRouterBytes32,
    );
    await tx2.wait();
    console.log("Destination router enrolled origin");

    console.log("Router pairing complete!");
}

setupChainPairing()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
