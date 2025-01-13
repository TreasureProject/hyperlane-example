import { HardhatUserConfig } from "hardhat/config";
import config from "./hardhat.config";

/**
 * Hyperlane Configuration
 *
 * networks: Network information pulled from Hardhat config
 * deployments: Contract addresses with optional hook and ISM (Interchain Security Module) addresses
 * relationships: One-way messaging channels between networks
 *   Format: [sourceNetwork, destinationNetwork]
 *   Example: ["topaz", "sepolia"] means contracts on topaz can message sepolia
 *   Note: For two-way messaging, need to define both directions explicitly
 */

type NetworkInfo = {
    chainId: number;
    gasAmount?: number;
};

type ContractDeployment = {
    address: string;
    hook?: string;
    ism?: string;
};

type HyperlaneConfig = {
    networks: {
        [networkName: string]: NetworkInfo;
    };
    deployments: {
        [contractName: string]: {
            [networkName: string]: ContractDeployment;
        };
    };
    relationships: {
        [contractName: string]: string[][];
    };
};

function generateNetworkConfig(config: HardhatUserConfig) {
    const networks: { [networkName: string]: NetworkInfo } = {};

    if (!config.networks) {
        throw new Error("Network configuration is required in Hardhat config");
    }

    for (const [name, network] of Object.entries(config.networks)) {
        if (!network) throw new Error("Network Missing");
        if (!network.chainId) throw new Error("chainId required");

        networks[name] = {
            chainId: network.chainId,
            gasAmount: "gasAmount" in network ? network.gasAmount : undefined,
        };
    }

    return networks;
}

// Example Data

export const HYPERLANE_CONFIG: HyperlaneConfig = {
    networks: generateNetworkConfig(config),
    deployments: {
        HypERC1155: {
            topaz: {
                address: "0x6339D171538988C827C351eE5675281d7F52aA43",
            },
        },
        HypERC1155Collateral: {
            sepolia: {
                address: "0xdb7f6A5f793C93F3666b80A563d69cF38A28E5b9",
            },
        },
    },
    relationships: {
        HypERC1155: [
            ["topaz", "sepolia"],
            ["sepolia", "topaz"],
        ],
        HypERC1155Collateral: [
            ["sepolia", "topaz"],
            ["topaz", "sepolia"],
        ],
    },
};
