export const HYPERLANE_CONFIG: HyperlaneConfig = {
    networks: {
        topaz: {
            chainId: 421614,
            gasAmount: 40000,
        },
        sepolia: {
            chainId: 11155111,
            gasAmount: 50000,
        },
    },
    deployments: {
        HypERC1155: {
            topaz: {
                address: "0x6339D171538988C827C351eE5675281d7F52aA43",
            },
            sepolia: {
                address: "0xdb7f6A5f793C93F3666b80A563d69cF38A28E5b9",
            },
        },
        HypERC1155Collateral: {
            sepolia: {
                address: "0xdb7f6A5f793C93F3666b80A563d69cF38A28E5b9",
            },
            topaz: {
                address: "0x6339D171538988C827C351eE5675281d7F52aA43",
            },
        },
    },
    relationships: {
        HypERC1155: [["topaz", "sepolia"]],
        HypERC1155Collateral: [["sepolia", "topaz"]],
    },
};
