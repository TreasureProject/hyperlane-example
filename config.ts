interface HLConfig {
    srcChain: string;
    pairing: {
        contract: string;
        srcAddr: string;
        peers: {
            contract: string;
            destAddr: string;
            chainId: number;
        }[];
    }[];
    gasConfig: {
        destinationGas: {
            [domain: number]: number;
        };
    };
    // Optional overrides
    customIsm?: string;
    customIgp?: string;
}

export const TOKEN_MAPPING: HLConfig[] = [
    {
        // must match network name in hardhat config
        srcChain: "arbsepolia",

        // all the contracts you want to enroll routers for on
        // the specified srcChain
        pairing: [
            {
                // Contract name a router contract on the src chain
                contract: "HypERC1155",
                srcAddr: "0xB3ea9dF901a9728DBCb3D5dc4a9498016FbB91Bb",
                // cross chain peers
                peers: [
                    {
                        contract: "HypERC1155",
                        destAddr: "0x413327b27FC728BBB91D681d2f36b2E02E1eDe17",
                        chainId: 11155111,
                    },
                ],
            },
        ],
        // used in the deploy process to define gas limit
        gasConfig: {
            destinationGas: {
                11155111: 200000,
            },
        },
    },
    {
        srcChain: "sepolia",
        pairing: [
            {
                contract: "HypERC1155",
                srcAddr: "0x413327b27FC728BBB91D681d2f36b2E02E1eDe17",
                peers: [
                    {
                        contract: "MyCustomHypERC20",
                        destAddr: "0xB3ea9dF901a9728DBCb3D5dc4a9498016FbB91Bb",
                        chainId: 421614,
                    },
                ],
            },
        ],
        gasConfig: {
            destinationGas: {
                421614: 500000,
            },
        },
    },
];
