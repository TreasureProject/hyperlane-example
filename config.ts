type RouterConfig = {
    contract: string;
    networks: {
        [networkName: string]: {
            address: string;
            peers: {
                networkName: string;
                address: string;
                hook?: string;
                ism?: string;
            }[];
        };
    };
};

type HyperlaneConfig = {
    routers: RouterConfig[];
    gasConfig: { [sourceChainId: number]: { [destChainId: number]: number } };
};

export const HYPERLANE_CONFIG: HyperlaneConfig = {
    routers: [
        {
            contract: "HypERC1155",
            networks: {
                // networks the above named contract is deployed on
                topaz: {
                    //address of the contract on the specified network
                    address: "0x6339D171538988C827C351eE5675281d7F52aA43",

                    // contract address and network (as defined in hardhat config)
                    // you want to pair the top level contract with
                    peers: [
                        {
                            networkName: "sepolia",
                            address: "0xdb7f6A5f793C93F3666b80A563d69cF38A28E5b9",
                        },
                    ],
                },
            },
        },
        {
            contract: "HypERC1155Collateral",
            networks: {
                sepolia: {
                    address: "0xdb7f6A5f793C93F3666b80A563d69cF38A28E5b9",
                    peers: [
                        {
                            networkName: "topaz",
                            address: "0x6339D171538988C827C351eE5675281d7F52aA43",
                        },
                    ],
                },
            },
        },
    ],
    gasConfig: {
        421614: { 11155111: 40000 },
        11155111: { 421614: 50000 },
    },
};
// // Example config
// export const HYPERLANE_CONFIG: HyperlaneConfig = {
//     // ... existing config
//     routers: [
//         {
//             contract: "HypERC1155",
//             networks: {
//                 arbsepolia: {
//                     address: "0x8614b2565b5454Dd4C3EfDC8897978A4DFA544C6",
//                     peers: [
//                         {
//                             networkName: "sepolia",
//                             hook: "0x1234...",
//                             interchainSecurityModule: "0x5678..."
//                         }
//                     ]
//                 },
//                 // ... other networks
//             },
//         },
//     ],
// };
