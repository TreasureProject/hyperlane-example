# Hyperlane Cross-Chain Scripts Documentation

### Transfer Collateral Script

A script for transferring wrapped ERC1155 tokens across different chains using Hyperlane's cross-chain messaging protocol.

### Usage

```bash
npx hardhat run scripts/transferCollateral.ts --network <network-name> <dest> <recipient> <tokenId> <amount>
```

### Arguments

| Parameter      | Description                            | Example                                      |
| -------------- | -------------------------------------- | -------------------------------------------- |
| `network-name` | Source network to transfer from        | `arbsepolia`, `topaz`                        |
| `dest`         | Destination domain ID                  | `421614` (Arbitrum Sepolia)                  |
| `recipient`    | Recipient address on destination chain | `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` |
| `tokenId`      | ID of the ERC1155 token to transfer    | `1`                                          |
| `amount`       | Amount of tokens to transfer           | `100`                                        |

### Network Domain IDs

| Network          | Chain ID | Description            |
| ---------------- | -------- | ---------------------- |
| Arbitrum Sepolia | 421614   | Arbitrum testnet       |
| Arbitrum         | 42161    | Arbitrum mainnet       |
| Topaz            | 978658   | Treasure Chain testnet |
| Treasure         | 61166    | Treasure Chain mainnet |

### Example

```bash
npx hardhat run scripts/transferCollateral.ts --network arbsepolia 978658 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 1 100
```

### Prerequisites

- Deployed HypERC1155Collateral contract
- Sufficient wrapped tokens in source wallet
- Sufficient native tokens for gas fees
- Network configured in Hardhat config

## Enroll Router Script

A configuration script that sets up cross-chain communication by enrolling remote routers and configuring security modules.

### Usage

```bash
npx hardhat run scripts/enrollRouter.ts --network <network-name>
```

### Configuration Requirements

| Config Section               | Description                         | Required Fields    |
| ---------------------------- | ----------------------------------- | ------------------ |
| `HYPERLANE_CONFIG.routers`   | Router configurations per network   | `address`, `peers` |
| `HYPERLANE_CONFIG.gasConfig` | Gas limits for cross-chain messages | Chain ID mappings  |

### Network Support

| Network          | RPC URL                          | Chain ID |
| ---------------- | -------------------------------- | -------- |
| Arbitrum Sepolia | `process.env.ARBSEP_RPC_URL`     | 421614   |
| Arbitrum         | Custom RPC                       | 42161    |
| Topaz            | `https://rpc.topaz.treasure.lol` | 978658   |
| Treasure         | `https://rpc.treasure.lol`       | 61166    |

### Example Configuration

```typescript
const HYPERLANE_CONFIG = {
    routers: [
        {
            networks: {
                arbsepolia: {
                    address: "0x...",
                    peers: [
                        {
                            networkName: "topaz",
                            address: "0x...",
                            ism: "0x...",
                        },
                    ],
                },
            },
        },
    ],
    gasConfig: {
        421614: {
            978658: 300000, // gas for messages to Topaz
        },
    },
};
```

### Example Usage

```bash
npx hardhat run scripts/enrollRouter.ts --network arbsepolia
```

### Expected Output

```
Gas configs set
Setting ISM...
Router enrolled for Topaz network
```

## Transfer ERC1155 Cross-Chain Script

A script to transfer ERC1155 tokens across different chains using Hyperlane's cross-chain messaging protocol.

## Description

This script facilitates the transfer of ERC1155 tokens from one chain to another, handling gas quotes and token value packing automatically.

## Usage

```bash
npx hardhat run scripts/transfer1155.ts --network <network> <dest> <recipient> <tokenId> <amount>
```

### Arguments

| Parameter   | Description                            | Example                                      |
| ----------- | -------------------------------------- | -------------------------------------------- |
| `network`   | Source network to transfer from        | `arbsepolia`, `topaz`                        |
| `dest`      | Destination domain ID                  | `421614` (arbsepolia), `978658` (topaz)      |
| `recipient` | Recipient address on destination chain | `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` |
| `tokenId`   | ID of the ERC1155 token to transfer    | `1`                                          |
| `amount`    | Amount of tokens to transfer           | `100`                                        |

### Example

```bash
npx hardhat run scripts/transfer1155.ts --network arbsepolia 978658 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 1 100
```

## Prerequisites

- Deployed HypERC1155 contract
- Sufficient tokens in the source wallet
- Sufficient native tokens for gas fees
- Network configured in Hardhat config
