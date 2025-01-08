import "hardhat/types/config";
import { HardhatUserConfig } from "hardhat/config";
declare module "hardhat/types/config" {
    export interface HardhatNetworkUserConfig {
        lzMailbox?: string;
        gasAmount?: number;
    }

    export interface HardhatNetworkConfig {
        lzMailbox?: string;
        gasAmount?: number;
    }

    export interface HttpNetworkUserConfig {
        lzMailbox?: string;
        gasAmount?: number;
    }

    export interface HttpNetworkConfig {
        lzMailbox?: string;
        gasAmount?: number;
    }
}
