import { HardhatUserConfig } from "hardhat/config";
import config from "./hardhat.config";
import { HyperlaneConfig, NetworkInfo } from "./types/enrollRouterTypes";

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
        MyCustomHypERC20: {
            sepolia: {
                address: "0xd117Ee788E6e4BB24f65D744e009219861697D24",
            },
        },
        MyCustomHypERC20Collateral: {
            arbsepolia: {
                address: "0x0fceE3f0a2d240bDBCb93627097f5491dC83Ed75",
            },
        },
    },
    relationships: {
        MyCustomHypERC20: [["sepolia", "arbsepolia"]],
        MyCustomHypERC20Collateral: [["arbsepolia", "sepolia"]],
    },
};
