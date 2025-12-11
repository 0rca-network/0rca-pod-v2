# 0rca POD Marketplace - Smart Contracts Documentation

## Overview

The 0rca POD Marketplace uses Algorand smart contracts for decentralized agent registry, payment processing, and event logging. This document details all smart contracts, their methods, and integration patterns.

## Deployed Contracts

### AgentsContract
- **App ID**: 749655317
- **Network**: Algorand TestNet
- **Purpose**: Main registry for all agents
- **Language**: AlgorandTypeScript (compiled to TEAL)

### LoggingContract
- **App ID**: 749653154
- **Network**: Algorand TestNet
- **Purpose**: Event logging and audit trail
- **Language**: AlgorandTypeScript (compiled to TEAL)

### SingleAgentContract
- **App ID**: Dynamically created per agent
- **Network**: Algorand TestNet
- **Purpose**: Individual agent payment and job management
- **Language**: AlgorandTypeScript (compiled to TEAL)

---

## AgentsContract (749655317)

### Purpose
Central registry that manages the creation and deletion of agent contracts. Acts as a factory for SingleAgentContract instances.

### Global State

| Key | Type | Description |
|-----|------|-------------|
| maintainerAddress | Account | Address of contract maintainer |
| number | uint64 | Counter for total agents created |

### Methods

#### createApplication(account)void

Initialize the contract with a maintainer address.

**Signature:**
```
createApplication(account)void
```

**Parameters:**
- `maintainerAddress` (Account): Address that can manage the contract

**Authorization:** Can only be called during contract creation

**Transaction Requirements:**
- OnComplete: NoOp
- Fee: 0.001 ALGO (minimum)

**Example:**
```typescript
const factory = new AgentsContractFactory({ algorand, defaultSender, defaultSigner })

const { appClient } = await factory.deploy({
  createParams: {
    method: 'createApplication',
    args: { maintainerAddress: maintainerAddress }
  }
})
```

---

#### createAgent(string,string,uint64,string)uint64

Create a new agent and deploy its smart contract.

**Signature:**
```
createAgent(string,string,uint64,string)uint64
```

**Parameters:**
- `agentName` (string): Display name of the agent
- `agentIPFS` (string): URL or IPFS hash for agent metadata
- `pricing` (uint64): Price in microAlgos (1 ALGO = 1,000,000 microAlgos)
- `agentImage` (string): Image URL or metadata reference

**Returns:**
- `uint64`: Application ID of the created SingleAgentContract

**Authorization:** Any authenticated user can create agents

**Transaction Requirements:**
- OnComplete: NoOp
- Fee: 0.02 ALGO (static fee to cover inner transactions)
- Minimum balance: 0.1 ALGO for contract creation

**Process:**
1. Logs event to LoggingContract
2. Compiles SingleAgentContract
3. Creates new application with provided parameters
4. Stores agent metadata in box storage
5. Increments agent counter
6. Returns new application ID

**Example:**
```typescript
const appClient = new AgentsContractClient({
  appId: 749655317n,
  algorand,
  defaultSender: activeAddress,
  defaultSigner: transactionSigner
})

const result = await appClient.send.createAgent({
  args: {
    agentName: 'My AI Agent',
    agentIpfs: 'https://my-agent.0rca.live',
    pricing: 1000000, // 1 ALGO
    agentImage: 'metadata'
  },
  staticFee: AlgoAmount.Algo(0.02)
})

const agentContractId = result.return
const agentAddress = getApplicationAddress(Number(agentContractId))
```

**Box Storage Format:**
```
Key: agentId (uint64 as bytes)
Value: {
  name: string,
  details: string,
  fixedPricing: uint64,
  createdAt: uint64,
  appID: uint64,
  creatorName: string
}
```

---

#### deleteAgent(uint64)void

Delete an agent contract from the registry.

**Signature:**
```
deleteAgent(uint64)void
```

**Parameters:**
- `agentId` (uint64): Application ID of the agent to delete

**Authorization:** Only the contract maintainer can delete agents

**Transaction Requirements:**
- OnComplete: NoOp
- Fee: 0.001 ALGO (minimum)

**Process:**
1. Verify sender is maintainer
2. Verify agent exists in box storage
3. Delete agent from box storage
4. Decrement agent counter
5. Log deletion event to LoggingContract

**Example:**
```typescript
await appClient.send.deleteAgent({
  args: { agentId: 123456789n },
  sender: maintainerAddress,
  signer: transactionSigner
})
```

---

## LoggingContract (749653154)

### Purpose
Immutable event logging for audit trail and transparency.

### Global State

| Key | Type | Description |
|-----|------|-------------|
| MANAGER_ADDRESS | Account | Address that can manage the contract |

### Methods

#### createApplication(account)void

Initialize the logging contract.

**Signature:**
```
createApplication(account)void
```

**Parameters:**
- `ownerAddress` (Account): Manager address

**Authorization:** Can only be called during contract creation

---

#### emit_log(string,uint64,string)void

Log an event to the blockchain.

**Signature:**
```
emit_log(string,uint64,string)void
```

**Parameters:**
- `eventName` (string): Type of event (e.g., "createAgent", "deleteAgent")
- `agentID` (uint64): Related agent application ID
- `status` (string): Event status (e.g., "success", "failed")

**Authorization:** Can be called by any contract or user

**Transaction Requirements:**
- OnComplete: NoOp
- Fee: 0.001 ALGO (minimum)

**Log Format:**
```
event: {eventName} agentID: {agentID} status: {status}
```

**Example:**
```typescript
const loggingClient = new LoggingContractClient({
  appId: 749653154n,
  algorand,
  defaultSender: address,
  defaultSigner: signer
})

await loggingClient.send.emitLog({
  args: {
    eventName: 'createAgent',
    agentId: 123456789n,
    status: 'success'
  }
})
```

---

## SingleAgentContract (Dynamic)

### Purpose
Individual contract for each agent that manages payments, job creation, and access control.

### Global State

| Key | Type | Description |
|-----|------|-------------|
| ownerAddress | Account | Agent owner address |
| taskCount | uint64 | Number of jobs processed |
| name | string | Agent name |
| details | string | Agent URL/IPFS |
| fixedPricing | uint64 | Price per job in microAlgos |

### Methods

#### createApplication(string,string,uint64)void

Initialize the agent contract.

**Signature:**
```
createApplication(string,string,uint64)void
```

**Parameters:**
- `name` (string): Agent name
- `details` (string): Agent URL or IPFS hash
- `fixedPricing` (uint64): Price in microAlgos

**Authorization:** Called automatically by AgentsContract.createAgent()

---

#### start_job(string)string

Create a new job and return payment transaction.

**Signature:**
```
start_job(string)string
```

**Parameters:**
- `jobInput` (string): User input data for the job

**Returns:**
- `string`: Job ID

**Process:**
1. Generate unique job ID
2. Store job in box storage with status "pending"
3. Return job ID to caller

**Note:** This is typically called via the agent's HTTP API, not directly on-chain.

---

#### verify_payment(string,string)bool

Verify payment for a job.

**Signature:**
```
verify_payment(string,string)bool
```

**Parameters:**
- `jobId` (string): Job identifier
- `txnId` (string): Payment transaction ID

**Returns:**
- `bool`: True if payment is valid

**Verification Steps:**
1. Check transaction exists on blockchain
2. Verify transaction is confirmed
3. Verify payment amount >= fixedPricing
4. Verify receiver is contract address
5. Verify transaction not already used
6. Update job status to "payment_verified"

---

## Transaction Patterns

### Atomic Transaction Groups

#### Payment + App Call Group

Used when hiring an agent:

```typescript
// Transaction 0: Payment
const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  from: userAddress,
  to: agentContractAddress,
  amount: agentPrice,
  suggestedParams: params
})

// Transaction 1: Application Call
const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
  from: userAddress,
  appIndex: agentAppId,
  appArgs: [
    new Uint8Array(Buffer.from('start_job')),
    new Uint8Array(Buffer.from(jobId))
  ],
  suggestedParams: params
})

// Group transactions
const groupID = algosdk.computeGroupID([paymentTxn, appCallTxn])
paymentTxn.group = groupID
appCallTxn.group = groupID

// Sign and submit
const signedTxns = [
  paymentTxn.signTxn(userPrivateKey),
  appCallTxn.signTxn(userPrivateKey)
]

await algodClient.sendRawTransaction(signedTxns).do()
```

---

## Contract Compilation

### Source Files

Located in `contracts/` directory:
- `AgentContracts.ts`: TypeScript client for AgentsContract
- `LogginContract.ts`: TypeScript client for LoggingContract

### Compilation Process

Contracts are written in AlgorandTypeScript and compiled to TEAL:

```bash
# Compile contracts
algokit compile contracts/Agents.algo.ts

# Output files
# - approval.teal: Main contract logic
# - clear.teal: Clear state program
```

### Approval Program

Base64 encoded in APP_SPEC:
```typescript
export const APP_SPEC: Arc56Contract = {
  source: {
    approval: "I3ByYWdtYSB2ZXJzaW9uIDEw...",
    clear: "I3ByYWdtYSB2ZXJzaW9uIDEw..."
  }
}
```

---

## State Management

### Global State

Stored on-chain, accessible to all:
- Limited to 64 key-value pairs
- Keys: up to 64 bytes
- Values: up to 128 bytes

### Box Storage

Used for larger data:
- Unlimited number of boxes
- Each box: up to 32KB
- Requires minimum balance increase
- Cost: 0.0025 ALGO per box + 0.0004 ALGO per KB

**Box Naming Convention:**
```
agents/{agentId} → Agent metadata
jobs/{jobId} → Job data
```

---

## Gas Fees and Costs

### Transaction Fees

| Operation | Fee | Notes |
|-----------|-----|-------|
| Payment | 0.001 ALGO | Minimum fee |
| App Call | 0.001 ALGO | Minimum fee |
| App Creation | 0.001 ALGO | Plus minimum balance |
| Inner Transaction | 0.001 ALGO | Per inner txn |
| Box Creation | 0.0025 ALGO | Plus storage cost |

### Minimum Balances

| Account Type | Minimum Balance |
|--------------|-----------------|
| Basic Account | 0.1 ALGO |
| Contract Account | 0.1 ALGO |
| + Per Global State | 0.025 ALGO |
| + Per Box | 0.0025 ALGO + 0.0004/KB |

---

## Security Considerations

### Access Control

```typescript
// Only maintainer can delete
assert(Txn.sender === Txn.applicationId.creator, 'Only maintainer can delete')

// Verify payment amount
assert(paymentTxn.amount >= this.fixedPricing.value, 'Insufficient payment')

// Prevent replay attacks
assert(!this.usedTransactions(txnId).exists, 'Transaction already used')
```

### Input Validation

```typescript
// Validate string lengths
assert(agentName.length <= 255, 'Name too long')

// Validate numeric ranges
assert(pricing > 0, 'Price must be positive')

// Validate addresses
assert(sender !== globals.zeroAddress, 'Invalid sender')
```

### Reentrancy Protection

Algorand's execution model prevents reentrancy:
- Atomic transaction execution
- No external calls during execution
- State changes committed atomically

---

## Testing

### Unit Tests

Located in `tests/` directory:

```typescript
// tests/agents-contract.test.ts
describe('AgentsContract', () => {
  it('should create agent', async () => {
    const result = await appClient.send.createAgent({
      args: {
        agentName: 'Test Agent',
        agentIpfs: 'https://test.com',
        pricing: 1000000,
        agentImage: 'test'
      }
    })
    
    expect(result.return).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```typescript
// Test full hiring flow
it('should complete hiring flow', async () => {
  // 1. Create agent
  const agentId = await createAgent()
  
  // 2. Start job
  const jobId = await startJob(agentId)
  
  // 3. Make payment
  const txid = await makePayment(agentId, jobId)
  
  // 4. Verify payment
  const verified = await verifyPayment(jobId, txid)
  expect(verified).toBe(true)
})
```

---

## Monitoring and Analytics

### On-Chain Events

Query LoggingContract for events:

```typescript
const logs = await algodClient
  .applicationInformation(749653154)
  .do()

// Parse logs
logs.forEach(log => {
  const decoded = Buffer.from(log, 'base64').toString()
  console.log('Event:', decoded)
})
```

### Contract State

```typescript
// Get global state
const appInfo = await algodClient
  .getApplicationByID(agentAppId)
  .do()

const globalState = appInfo.params['global-state']
```

### Box Storage

```typescript
// List all boxes
const boxes = await algodClient
  .getApplicationBoxes(agentAppId)
  .do()

// Get box contents
const boxValue = await algodClient
  .getApplicationBoxByName(agentAppId, boxName)
  .do()
```

---

## Upgrade and Migration

### Contract Upgrades

Algorand contracts are immutable by default. To upgrade:

1. Deploy new contract version
2. Migrate state to new contract
3. Update frontend to use new App ID
4. Deprecate old contract

### State Migration

```typescript
async function migrateAgents(oldAppId: number, newAppId: number) {
  // 1. Read all agents from old contract
  const agents = await readAllAgents(oldAppId)
  
  // 2. Create agents in new contract
  for (const agent of agents) {
    await createAgentInNewContract(newAppId, agent)
  }
  
  // 3. Verify migration
  await verifyMigration(oldAppId, newAppId)
}
```

---

## Best Practices

1. **Always use static fees** for inner transactions
2. **Validate all inputs** before processing
3. **Use box storage** for large data
4. **Implement access control** for sensitive operations
5. **Log important events** to LoggingContract
6. **Test thoroughly** on TestNet before MainNet
7. **Monitor contract state** regularly
8. **Plan for upgrades** from the start
9. **Document all methods** clearly
10. **Use atomic transactions** for related operations
