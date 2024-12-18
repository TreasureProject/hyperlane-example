interface ChainConfig {
    id: number;
    name: string;
}

interface RouterConfig {
    contract: string;
    addresses: { [chainName: string]: string };
    peerMap: { [chainName: string]: string[] };
}

interface HyperlaneConfig {
    chains: { [chainName: string]: ChainConfig };
    routers: RouterConfig[];
    gasConfig: { [sourceChainId: number]: { [destChainId: number]: number } };
}

export const HYPERCHAIN_CONFIG: HyperlaneConfig = {
    chains: {
        arbsepolia: { id: 421614, name: "Arbitrum Sepolia" },
        sepolia: { id: 11155111, name: "Ethereum Sepolia" },
        base: { id: 84531, name: "Base Goerli" },
    },
    routers: [
        {
            contract: "HypERC1155",
            addresses: {
                arbsepolia: "0x25428765Eb62C70E48cAbc3391cdBa7f9fEaD514",
                sepolia: "0xd8c5a828f0E61EEE387e4e5b553bB8a2ba798e42",
                base: "0x1234567890123456789012345678901234567890",
            },
            peerMap: {
                arbsepolia: ["sepolia"],
                sepolia: ["arbsepolia"],
                base: ["sepolia", "arbsepolia"],
            },
        },
    ],
    gasConfig: {
        421614: { 11155111: 500000, 84531: 300000 },
        11155111: { 421614: 200000, 84531: 250000 },
        84531: { 421614: 300000, 11155111: 250000 },
    },
};
