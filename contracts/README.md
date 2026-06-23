# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

## 🛠️ Running and Deploying Contracts in the Terminal

This project uses **Foundry** (with npm scripts) as its primary toolkit for smart contract compilation, testing, and deployment.

### 1. Compile Contracts
To compile all the Solidity smart contracts:
```shell
npm run build
# OR
forge build
```

### 2. Run Tests
To run all the Foundry unit tests:
```shell
npm run test
# OR
forge test
```

### 3. Start Local Blockchain
To spin up a local development blockchain node (Anvil) running on `http://127.0.0.1:8545`:
```shell
npm run node
# OR
anvil
```

### 4. Deploy Contracts (Local Chain)
To deploy the contracts to your running local blockchain and automatically sync the ABIs and addresses to both frontend and backend configurations:
1. Ensure the local blockchain node is running in a terminal (`npm run node`).
2. Run the deployment script:
```shell
npm run deploy
```

### 5. Deploy Contracts (Sepolia Testnet)
To deploy contracts to the live online Sepolia Testnet:
1. Ensure you have a developer wallet with Sepolia test ETH.
2. Run the forge deployment script, passing your Sepolia private key and RPC URL.
3. Run the export script with Sepolia's chain ID (`11155111`) to link the deployed contracts to your frontend and backend.

**For Windows (PowerShell):**
```powershell
# 1. Set your private key (make sure to include the 0x prefix)
$env:PRIVATE_KEY="0xYOUR_PRIVATE_KEY"

# 2. Deploy contracts to Sepolia via Forge
forge script scripts/Deploy.s.sol --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY --broadcast --private-key $env:PRIVATE_KEY

# 3. Export ABIs and deployed addresses to the rest of the project
node scripts/export_abis.js 11155111
```

**For Linux/macOS (bash):**
```bash
# 1. Set your private key (make sure to include the 0x prefix)
export PRIVATE_KEY="0xYOUR_PRIVATE_KEY"

# 2. Deploy contracts to Sepolia via Forge
forge script scripts/Deploy.s.sol --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY --broadcast --private-key $PRIVATE_KEY

# 3. Export ABIs and deployed addresses to the rest of the project
node scripts/export_abis.js 11155111
```

