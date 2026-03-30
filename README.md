# PrivaScore

Private on-chain credit scoring for DeFi using Fhenix FHE.

PrivaScore stores user credit scores as encrypted values on-chain and lets lenders check eligibility against an encrypted threshold without exposing the raw score.

## What's in this repo

- `contracts/`: Hardhat smart contract for encrypted credit score storage and eligibility checks
- `scripts/`: deployment script
- `test/`: Hardhat tests
- `frontend/`: Next.js + Tailwind frontend for interacting with the contract

## Stack

- Solidity `0.8.25`
- Hardhat + TypeScript
- Fhenix `cofhe-contracts`
- `cofhejs`
- Next.js + Tailwind CSS + Ethers

## Core flow

1. An oracle assigns or updates a wallet's encrypted credit score.
2. A lender checks whether that score is above an encrypted threshold.
3. The lender receives only an encrypted boolean eligibility result.
4. The wallet owner can retrieve their encrypted score hash and unseal it off-chain.

## Local setup

### Install root dependencies

```bash
npm install
```

### Install frontend dependencies

```bash
cd frontend
npm install
```

## Environment

Create a root `.env` file based on `.env.example` and add the required values for deployment.

For the frontend, create `frontend/.env.local` from `frontend/.env.example` when running locally.

## Useful commands

From the repo root:

```bash
npm run compile
npm test
npm run deploy:sepolia
```

From `frontend/`:

```bash
npm run dev
npm run build
```

## Vercel deployment

This repo includes a root `vercel.json` that tells Vercel to build the Next.js app from `frontend/` and publish the static export from `frontend/out`.

Set these Vercel project environment variables before deploying:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_ORACLE_ADDRESS=your_oracle_wallet_address
```

## Network

The deployment script is configured for Arbitrum Sepolia.

## Contract summary

`PrivaScore.sol` supports:

- oracle-managed encrypted score updates
- owner-controlled lender registration
- lender eligibility checks using encrypted thresholds
- user retrieval of their encrypted score hash

## Notes

- Raw scores are not exposed on-chain.
- Access to decryption is controlled through FHE permissions.
- Generated artifacts and secrets are excluded from git via `.gitignore`.
