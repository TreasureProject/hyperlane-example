import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

import "./tasks/mintErc20";
import "./tasks/transfer";
import "./tasks/enrollRouter";
import "./tasks/log";

if (typeof process.env.PRIVATE_KEY === "undefined") {
    throw new Error("PRIVATE KEY REQUIRED");
}

if (typeof process.env.ARBSEP_RPC_URL === "undefined") {
    throw new Error("RPC URL required");
}

const config: HardhatUserConfig = {
    namedAccounts: {
        deployer: {
            default: 0,
            421614: 0,
            11155111: 0,
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
        arbsepolia: {
            url: process.env.ARBSEP_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 421614,
        },
        sepolia: {
            url: process.env.SEP_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
        },
    },
};

export default config;
