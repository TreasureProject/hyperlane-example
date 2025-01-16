/**
 * Configuration interface for Hyperlane router deployment and enrollment
 */
export interface RouterConfig {
    /**
     * Network-specific configurations
     * @property contractName - Name of the contract deployed on this network
     * @property gas - Optional gas limit override. If not specified, uses Hyperlane's default (~50,000)
     */
    networks: {
        [network: string]: {
            contractName: string;
            gas?: string;
        };
    };
}

/**
 * Example configuration:
 * export const hyperlaneConfig: RouterConfig[] = [
 *     {
 *         networks: {
 *             sepolia: {
 *                 contractName: "MyContract",
 *                 gas: "200000", // Optional: Overrides default gas limit
 *             },
 *             arbsepolia: {
 *                 contractName: "MyCollateralContract"  // Uses default gas limit
 *             }
 *         }
 *     }
 * ];
 */

export const hyperlaneConfig: RouterConfig[] = [];
