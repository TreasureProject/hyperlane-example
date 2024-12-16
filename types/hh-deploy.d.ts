import "hardhat-deploy/dist/types.d.ts";

declare module "hardhat-deploy/dist/types.d.ts" {
    interface DeploymentSubmission {
        peers?: {
            chainId: number;
            name: string;
        }[];
    }
    interface Deployment {
        peers?: {
            chainId: number;
            name: string;
        }[];
    }
}

export {};
