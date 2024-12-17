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
                contract: "MyCustomHypERC20",
                srcAddr: "0xd99D843C9Cab9FF5AabeC20aCCfd1D3b58656f31",
                // cross chain peers
                peers: [
                    {
                        contract: "MyCustomHypERC20",
                        destAddr: "0xD7dB5038fb3a06A3bfeD6bab3b7E526d1f241277",
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
                contract: "MyCustomHypERC20",
                srcAddr: "0xD7dB5038fb3a06A3bfeD6bab3b7E526d1f241277",
                peers: [
                    {
                        contract: "MyCustomHypERC20",
                        destAddr: "0xd99D843C9Cab9FF5AabeC20aCCfd1D3b58656f31",
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
