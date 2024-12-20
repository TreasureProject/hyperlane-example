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
                sepolia: {
                    //address of the contract on the specified network
                    address: "0xb2B4bCEF2094c7a56f4C6B",

                    // contract address and network (as defined in hardhat config)
                    // you want to pair the top level contract with
                    peers: [
                        {
                            networkName: "arbsepolia",
                            address: "0x8614b2565b5454Dd4",
                        },
                    ],
                },
            },
        },
        {
            contract: "HypERC1155Collateral",
            networks: {
                arbsepolia: {
                    address: "0x8614b2565b5454Dd",
                    peers: [
                        {
                            networkName: "sepolia",
                            address: "0xb2B4bCEF2094c7a56f4C6",
                        },
                    ],
                },
            },
        },
    ],
    gasConfig: {
        421614: { 11155111: 500000 },
        11155111: { 421614: 200000 },
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
