interface HLConfig {
    name: string;
    chainId: number;
    mailbox: string;
    peers: {
        chainId: number;
        name: string;
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

export const TOKEN_CONFIG = {
    name: "My Hyperlane Token",
    symbol: "MHT",
    decimals: 18,
    totalSupply: "1000000000000000000000000", // 1 million
};

export const NETWORK_CONFIG: HLConfig[] = [
    {
        name: "sepolia",
        chainId: 11155111,
        mailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766",
        peers: [
            {
                name: "arbsepolia",
                chainId: 421614,
            },
        ],
        gasConfig: {
            destinationGas: {
                421614: 500000,
            },
        },
    },
    {
        name: "arbsepolia",
        chainId: 421614,
        mailbox: "0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8",
        peers: [
            {
                name: "sepolia",
                chainId: 11155111,
            },
        ],
        gasConfig: {
            destinationGas: {
                11155111: 200000,
            },
        },
    },
];
