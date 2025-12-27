# 🚀 Deploy to Public Testnets

Since the remote ETH PBC EVM RPC is not accessible, let's deploy to public testnets instead!

## ✅ Advantages of Testnet Deployment

1. **Real blockchain experience** - Test on actual networks
2. **Multi-chain testing** - Deploy to multiple chains
3. **Free** - No real money needed (testnet tokens)
4. **Block explorers** - Verify contracts on Etherscan, etc.
5. **Public accessibility** - Share contract addresses with team

## 📋 Quick Testnet Deployment

### Step 1: Get Testnet Tokens

You'll need testnet ETH/tokens for gas:

**Sepolia (Ethereum Testnet)**:
- Faucet: https://sepoliafaucet.com/
- Or: https://www.alchemy.com/faucets/ethereum-sepolia

**BNB Testnet**:
- Faucet: https://testnet.bnbchain.org/faucet-smart

**Polygon Mumbai**:
- Faucet: https://faucet.polygon.technology/

**Arbitrum Sepolia**:
- Faucet: https://faucet.quicknode.com/arbitrum/sepolia

**Base Sepolia**:
- Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Step 2: Deploy to Single Testnet (Sepolia)

```bash
cd /Users/macbook/Desktop/etrid-workspace/etrid/contracts/ethereum

# Deploy to Sepolia
npm run deploy:sepolia

# Or explicitly
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 3: Deploy to Multiple Testnets

```bash
# Deploy per network (ensure each network is configured in hardhat.config.js)
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy-bsc.js --network bsc
npx hardhat run scripts/deploy.js --network base
```

This will deploy to the networks configured in `hardhat.config.js` (Sepolia, BNB, Base, etc.).

### Step 4: Verify Contracts

After deployment, verify on block explorers:

```bash
# Verify on Sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example:
npx hardhat verify --network sepolia 0x123... 0xYourAdminAddress
```

## 🎯 Alternative: Deploy to Local ETH PBC

If you want to use ETH PBC specifically:

### Option A: Start Local ETH PBC Node

```bash
# Build and start ETH PBC with EVM RPC enabled
cd /Users/macbook/Desktop/etrid-workspace/etrid/05-multichain/partition-burst-chains/pbc-chains/eth-pbc
cargo build --release -p eth-pbc-collator
# Use the flags from DEPLOYMENT_INSTRUCTIONS.md to enable EVM RPC
# Path: /Users/macbook/Desktop/etrid-workspace/etrid/05-multichain/partition-burst-chains/pbc-chains/eth-pbc/DEPLOYMENT_INSTRUCTIONS.md

# Then deploy
npx hardhat run scripts/deploy.js --network ethPBC
```

### Option B: Configure Remote ETH PBC Node

The remote node needs these flags enabled:
- `--eth-rpc-url http://0.0.0.0:8545`
- `--ethapi debug,eth,net,txpool,web3`
- `--rpc-external`

Contact whoever manages `163.192.125.23` to enable EVM RPC.

## 📊 Recommended Path

**Path 1: Quick Win** (5 minutes)
```bash
# 1. Get Sepolia testnet ETH from faucet
# 2. Deploy to Sepolia
npm run deploy:sepolia  # Uses Sepolia config in hardhat.config.js
```

**Path 2: Full Multi-Chain** (30 minutes)
```bash
# 1. Get testnet tokens for all chains
# 2. Deploy per testnet (repeat per network)
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy-bsc.js --network bsc
npx hardhat run scripts/deploy.js --network base
```

**Path 3: Local ETH PBC** (10 minutes)
```bash
# 1. Build ETH PBC collator (if needed)
cd /Users/macbook/Desktop/etrid-workspace/etrid/05-multichain/partition-burst-chains/pbc-chains/eth-pbc
cargo build --release -p eth-pbc-collator

# 2. Start with EVM RPC (see DEPLOYMENT_INSTRUCTIONS.md for flags)
./target/release/eth-pbc-collator --dev --tmp

# 3. Deploy
npx hardhat run scripts/deploy.js --network ethPBC
```

## 🎯 What I Recommend

Since you've already tested locally successfully, I recommend:

**Go with Path 1 (Sepolia)** because:
- ✅ Works immediately (demo RPC available)
- ✅ Real blockchain experience
- ✅ Can verify on Etherscan
- ✅ Share with team easily
- ✅ No need to run local nodes

Once Sepolia works, you can deploy to other testnets or configure ETH PBC properly.

## 🚀 Ready to Deploy?

Just run:
```bash
cd /Users/macbook/Desktop/etrid-workspace/etrid/contracts/ethereum
npm run deploy:sepolia
```

This will deploy all 5 contracts to Ethereum's Sepolia testnet using your configured RPC.

**Time**: 3-5 minutes  
**Cost**: Free (uses demo RPC)  
**Result**: Real deployed contracts you can verify on Sepolia Etherscan

---

**Which path do you want to take?**
1. Deploy to Sepolia now (easiest)
2. Get testnet tokens and deploy to multiple chains
3. Start local ETH PBC node with EVM RPC
