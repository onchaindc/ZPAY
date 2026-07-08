# ZPAY

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-20232A?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Zama FHEVM](https://img.shields.io/badge/Zama-FHEVM-111827)](https://www.zama.ai/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-8B5CF6)](https://sepolia.etherscan.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

Confidential payments on Ethereum, powered by Zama FHEVM.

## 🚀 Project Overview

ZPAY is a confidential payments application built with Zama FHEVM. It enables private value flows on Ethereum while keeping sensitive balance and transfer data encrypted on-chain.

Users can:

- Shield funds into an encrypted vault
- View confidential balances
- Send encrypted transfers
- Request confidential withdrawals (unshield)
- Preserve financial privacy using Fully Homomorphic Encryption

## 🔒 Why ZPAY

Traditional blockchains expose balances, transfers, and transaction history by default. That transparency is valuable for verification, but it is poorly suited for real-world payments where users expect financial privacy.

ZPAY solves this by using Fully Homomorphic Encryption through Zama FHEVM. Instead of storing plaintext balances and amounts on-chain, ZPAY keeps payment state encrypted while still allowing the vault contract to execute confidential logic securely.

## ✨ Features

- Confidential balances
- Confidential transfers
- Shield deposits
- Confidential withdrawal flow
- Local balance decryption
- Event history
- Responsive desktop and mobile UI
- Sepolia deployment

## 🧱 Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Solidity
- Hardhat
- Zama FHEVM
- ethers.js
- MetaMask
- Vercel

## 📜 Smart Contract

ZPAY uses a vault contract that processes confidential balances as encrypted on-chain state.

- `shield()`  
  Accepts value into the vault and credits encrypted balance.

- `transfer()`  
  Moves encrypted value between users without exposing the amount publicly.

- `balanceOf()`  
  Returns the encrypted balance handle for a user.

- `unshield()`  
  Initiates the confidential withdrawal flow.

- `finalizeUnshield()`  
  Verifies decryption proof and completes ETH release.

Balances remain encrypted on-chain throughout normal operation.

## 🔁 Confidential Withdrawal Flow

1. User requests withdrawal.
2. Ciphertext becomes publicly decryptable.
3. Zama relayer/KMS returns verified plaintext.
4. Contract verifies proof.
5. ETH is released.
6. Encrypted balance is reduced.

## 🏗️ Architecture

```text
User
↓
Frontend (Next.js)
↓
MetaMask
↓
ZPAY Vault (FHEVM)
↓
Encrypted State
↓
Zama Relayer/KMS
↓
Verified Decryption Callback
```

## 💻 Local Development

Frontend app in this repository:

```bash
npm install
npm run dev
```

Smart contract workflow used for the hackathon build:

```bash
npm run compile
npm run deploy:sepolia
npm run test
```

Note: this repository currently contains the ZPAY frontend package. The contract workflow commands above belong to the Solidity/Hardhat portion of the project and should be run from that workspace when present.


ZPAY is a practical showcase of confidential payments on Ethereum. It demonstrates how users can shield value, manage encrypted balances, transfer funds privately, and unshield assets through a wallet-first experience powered by Zama FHEVM.
