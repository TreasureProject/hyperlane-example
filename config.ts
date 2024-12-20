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
                    address: "0xEc25775680632F60c9b95c9b87B7681Fb2EEbdd2",

                    // contract address and network (as defined in hardhat config)
                    // you want to pair the top level contract with
                    peers: [
                        {
                            networkName: "arbsepolia",
                            address: "0xB209D2C6a30dE0ef713d38d7Af4819f3A83b1bac",
                        },
                    ],
                },
            },
        },
        {
            contract: "HypERC1155Collateral",
            networks: {
                arbsepolia: {
                    address: "0xB209D2C6a30dE0ef713d38d7Af4819f3A83b1bac",
                    peers: [
                        {
                            networkName: "sepolia",
                            address: "0xEc25775680632F60c9b95c9b87B7681Fb2EEbdd2",
                        },
                    ],
                },
            },
        },
    ],
    gasConfig: {
        421614: { 11155111: 500000 },
        11155111: { 421614: 500000 },
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
