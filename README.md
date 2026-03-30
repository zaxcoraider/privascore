# PrivaScore

Private on-chain credit scoring for DeFi using Fhenix FHE.

PrivaScore stores user credit scores as encrypted values on-chain and lets lenders check eligibility against an encrypted threshold without exposing the raw score.

## What's in this repo

- `contracts/`: Hardhat smart contract for encrypted credit score storage and eligibility checks
- `scripts/`: deployment script
- `test/`: Hardhat tests
- `frontend/`: React + Vite frontend for interacting with the contract

## Stack

- Solidity `0.8.25`
- Hardhat + TypeScript
- Fhenix `cofhe-contracts`
- `cofhejs`
- React + Vite + Ethers

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
npm run preview
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
