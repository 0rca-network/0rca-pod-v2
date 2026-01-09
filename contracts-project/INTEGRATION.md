# ERC-8004 Integration & Setup Guide

This document covers how to set up the development environment on Windows and integrate the 0rca Identity and Reputation registries into your website.

## 🛠️ Windows Development Setup

To avoid native binary crashes (EDR issues) on Windows, follow these steps:

### STEP 1 — Node.js Version
Hardhat 3 officially recommends **Node 22.10.0+**.
- **Verified Working**: **Node v22.21.1** (x64) successfully compiled the contracts in this environment.
- **Alternative**: Node 18 LTS is also recommended by some setups to avoid specific EDR native crashes.
- Verify in PowerShell:
  ```powershell
  node -v
  node -p "process.arch" # Must be x64
  ```

### STEP 2 — Clean Project
If you encounter issues, run these commands in PowerShell from the project root:
```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
del package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
```

---

## 🌐 Website Integration

### 1. Contract Addresses
| Contract | Description |
| :--- | :--- |
| **IdentityRegistry** | Manages agent identifiers (NFTs). |
| **ReputationRegistry** | Handles feedback, revocations, and responses. |
| **ValidationRegistry** | Manages validation logic. |

### 2. Frontend Usage (Viem Example)

#### Giving Feedback
```typescript
import { createWalletClient, custom } from 'viem';
import { reputationRegistryAbi } from './abis';

const client = createWalletClient({ transport: custom(window.ethereum) });

await client.writeContract({
  address: REPUTATION_REGISTRY_ADDRESS,
  abi: reputationRegistryAbi,
  functionName: 'giveFeedback',
  args: [
    agentId,
    score, // 0-100
    tag1,  // bytes32
    tag2,  // bytes32
    feedbackUri,
    feedbackHash,
    authBytes // Signed authorization from your backend
  ]
});
```

#### Fetching Reputation Summary
```typescript
const [count, averageScore] = await publicClient.readContract({
  address: REPUTATION_REGISTRY_ADDRESS,
  abi: reputationRegistryAbi,
  functionName: 'getSummary',
  args: [agentId, [], "0x0...", "0x0..."]
});
```

### 3. Security Note
The `giveFeedback` function requires a `feedbackAuth` signature. You should implement a backend service to sign these authorizations for verified users to prevent spam and ensure data integrity.
