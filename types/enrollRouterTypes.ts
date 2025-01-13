export type NetworkInfo = {
    chainId: number;
    gasAmount?: number;
};

export type ContractDeployment = {
    address: string;
    hook?: string;
    ism?: string;
};

export type HyperlaneConfig = {
    networks: {
        [networkName: string]: NetworkInfo;
    };
    deployments: {
        [contractName: string]: {
            [networkName: string]: ContractDeployment;
        };
    };
    relationships: {
        [contractName: string]: string[][];
    };
};
