# Foundry FundMe React App
Repo contains foundry smart contract and React client to interact with

# FundMe smart contract 
The "FundMe" smart contract allows users (wallets) to send (transfer) ETH at least 5 USD worth and store on smart contract (on blockchain) and only owner can withdraw all accumulated funds.

# React client 
React website to connect with metamask and interact with contract

# Quickstart
Provide private keys for:

## Step 1
SEPOLIA_RPC_URL - to deploy with sepolia
ETHERSCAN_API_KEY - to validate you smart contract on blockchain
PRIVATE_KEY - the key of wallet which will deploy given contract
DEFAULT_ANVIL_KEY - some of private key on anvil local blockchain

## Step 2
Run make deploy - Deploy contract for chosen chain  
Copy returned address and replace on ./react-client/constant/contractAddress
Run react app with yarn dev

## Step 3
Connect with wallet and interact with fund, withdraw, getBalance!!!

# Function selector
During transaction process we can check which function was called
cast sig "method()" will print signature ex. 0xb60d4288

cast --to-dec 0x0429d069189e0000