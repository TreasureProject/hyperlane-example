import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

if (typeof process.env.PRIVATE_KEY === "undefined") {
    throw new Error("PRIVATE KEY REQUIRED");
}

if (typeof process.env.ARB_RPC_URL === "undefined") {
    throw new Error("RPC URL required");
}

const config: HardhatUserConfig = {
    namedAccounts: {
        deployer: {
            default: 0,
            42161: 0, // arbitrum
        },
    },
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        arbitrum: {
            url: process.env.ARB_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 42161,
        },
    },
};

export default config;
