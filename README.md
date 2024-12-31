# Hyperlane Cross-Chain Tasks Documentation

This repository contains Hardhat tasks for managing token transfers and router configurations across different chains using Hyperlane protocol.

## Enroll Routers

The `enroll-routers` task is crucial for establishing cross-chain communication channels in Hyperlane by configuring remote routers and their security settings.

### Configuration Structure

The task expects a `HYPERLANE_CONFIG` object with the following structure:

```typescript
{
  routers: [{
    networks: {
      [networkName]: {
        address: string,
        peers: [{
          networkName: string,
          ism?: string,
          hook?: string,
          address: string
        }]
      }
    }
  }],
  gasConfig: {
    [chainId: number]: {
      [destChainId: string]: number
    }
  }
}
```

### Execution Steps

1. **Gas Configuration**

    - Sets destination-specific gas limits for cross-chain messages
    - Configures how much gas should be provided for message processing on each destination chain

2. **Hook Configuration**

    - Optional middleware that can intercept and modify messages
    - Executes custom logic before or after message processing

3. **ISM (Interchain Security Module) Setup**

    - Configures security parameters for cross-chain messages
    - Validates incoming messages based on custom security rules

4. **Router Enrollment**
    - Registers remote router addresses for each destination chain
    - Establishes trusted communication channels between chains

### Usage

```bash
npx hardhat enroll-routers
```

## Token Transfers

### ERC1155 Transfer

Transfers ERC1155 tokens across chains using Hyperlane protocol.

```bash
npx hardhat transfer-1155 --dest <domain> --recipient <address> --tokenid <id> --amt <amount>
```

| Parameter | Description           |
| --------- | --------------------- |
| dest      | Destination domain ID |
| recipient | Recipient address     |
| tokenid   | Token ID to transfer  |
| amt       | Amount of tokens      |

### Collateralized ERC1155 Transfer

Transfers wrapped ERC1155 tokens across chains with collateral backing.

```bash
npx hardhat transfer-1155-collateral --dest <domain> --recipient <address> --tokenid <id> --amt <amount>
```

| Parameter | Description           |
| --------- | --------------------- |
| dest      | Destination domain ID |
| recipient | Recipient address     |
| tokenid   | Token ID to transfer  |
| amt       | Amount of tokens      |

## Supported Networks

| Network          | Chain ID | Type    |
| ---------------- | -------- | ------- |
| Arbitrum Sepolia | 421614   | L2      |
| Sepolia          | 11155111 | Testnet |
| Topaz            | 978658   | zkSync  |
| Treasure         | 61166    | zkSync  |

## Technical Implementation Details

### Token Transfer Logic

- Uses packed values for token ID and amount (tokenId << 128 | amount)
- Automatically quotes and includes gas payment for cross-chain transfers
- Handles approval checks for collateralized transfers

### Router Configuration

- Supports custom gas configurations per destination chain
- Configurable hooks and ISM modules
- Network-specific peer configurations

### Security Considerations

- Requires proper ISM configuration for secure cross-chain messaging
- Implements approval checks for collateralized transfers
- Validates gas quotes before transfer execution

### Important Notes

- Router enrollment must be performed on all participating chains
- Gas configurations should be carefully set to ensure message processing
- ISM and hooks are optional but recommended for enhanced security
- Each network requires corresponding peer configurations in the HYPERLANE_CONFIG
