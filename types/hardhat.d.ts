import "hardhat/types/config";
import { HardhatUserConfig } from "hardhat/config";
declare module "hardhat/types/config" {
    export interface HardhatNetworkUserConfig {
        lzMailbox?: string;
    }

    export interface HardhatNetworkConfig {
        lzMailbox?: string;
    }

    export interface HttpNetworkUserConfig {
        lzMailbox?: string;
    }

    export interface HttpNetworkConfig {
        lzMailbox?: string;
    }
}
