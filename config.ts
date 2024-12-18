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
                srcAddr: "0x25428765Eb62C70E48cAbc3391cdBa7f9fEaD514",
                // cross chain peers
                peers: [
                    {
                        contract: "HypERC1155",
                        destAddr: "0xd8c5a828f0E61EEE387e4e5b553bB8a2ba798e42",
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
                srcAddr: "0xd8c5a828f0E61EEE387e4e5b553bB8a2ba798e42",
                peers: [
                    {
                        contract: "HypERC1155",
                        destAddr: "0x25428765Eb62C70E48cAbc3391cdBa7f9fEaD514",
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
