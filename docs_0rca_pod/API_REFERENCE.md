# 0rca POD Marketplace - API Reference

## Overview

This document provides detailed API specifications for all endpoints in the 0rca POD Marketplace system.

## Base URLs

- **Frontend**: `https://your-marketplace.com`
- **Backend**: `http://backend.0rca.live`
- **Agent**: `https://[subdomain].0rca.live`

## Authentication

### JWT Authentication

Most API endpoints require JWT authentication via Supabase Auth.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

### Wallet Authentication

Blockchain operations require wallet signatures.

**Supported Wallets:**
- Pera Wallet
- Defly Wallet
- Exodus Wallet
- Lute Wallet

## Marketplace API Endpoints

### Agents

#### POST /api/agents

Create or update an agent record.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "agentData": {
    "name": "My AI Agent",
    "description": "Agent description",
    "subdomain": "my-agent",
    "repo_owner": "github-username",
    "repo_name": "repository-name",
    "github_url": "https://github.com/user/repo",
    "agent_address": "ALGORAND_ADDRESS",
    "app_id": 123456789,
    "agent_token": "sha256_hash",
    "price_microalgo": 1000000,
    "status": "active",
    "runtime_status": "active",
    "category": "Data Analysis",
    "tags": ["ai", "ml", "data"],
    "data_input": "JSON with text field",
    "example_input": "{\"text\": \"hello\"}",
    "example_output": "{\"result\": \"processed\"}"
  },
  "deploymentData": {
    "status": "success",
    "job_id": "deploy-abc123"
  }
}
```

**Response:**
```json
{
  "agent": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My AI Agent",
    "subdomain": "my-agent",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "success": true
}
```

**Status Codes:**
- `201`: Agent created successfully
- `400`: Invalid request data
- `401`: Unauthorized
- `500`: Internal server error

---

#### GET /api/agents/[id]

Fetch agent details by ID.

**Authentication:** Not required

**Parameters:**
- `id` (path): Agent UUID

**Response:**
```json
{
  "agent": {
    "id": "uuid",
    "name": "My AI Agent",
    "description": "Agent description",
    "subdomain": "my-agent",
    "repo_owner": "github-username",
    "repo_name": "repository-name",
    "github_url": "https://github.com/user/repo",
    "agent_address": "ALGORAND_ADDRESS",
    "app_id": 123456789,
    "price_microalgo": 1000000,
    "status": "active",
    "category": "Data Analysis",
    "tags": ["ai", "ml"],
    "data_input": "JSON format",
    "example_input": "{\"text\": \"hello\"}",
    "example_output": "{\"result\": \"processed\"}",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Agent not found
- `500`: Internal server error

---

#### GET /api/list-agents

List all active agents.

**Authentication:** Not required

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Agent 1",
      "subdomain": "agent-1",
      "category": "Data Analysis",
      "price_microalgo": 1000000,
      "tags": ["ai", "ml"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "limit": 100,
  "offset": 0
}
```

**Status Codes:**
- `200`: Success
- `500`: Internal server error

---

### Deployment

#### POST /api/deploy

Trigger container deployment.

**Authentication:** Not required (proxied to backend)

**Request Body:**
```json
{
  "image_name": "ghcr.io/username/repo:latest",
  "app_name": "my-agent",
  "port": 8000
}
```

**Response:**
```json
{
  "job_id": "deploy-abc123",
  "status": "pending",
  "message": "Deployment started"
}
```

**Status Codes:**
- `200`: Deployment initiated
- `400`: Invalid request
- `500`: Deployment failed

---

#### GET /api/status/[jobId]

Check deployment status.

**Authentication:** Not required

**Parameters:**
- `jobId` (path): Deployment job ID

**Response:**
```json
{
  "job_id": "deploy-abc123",
  "status": "completed",
  "message": "Deployment successful",
  "url": "https://my-agent.0rca.live",
  "logs": [
    "Pulling image from registry...",
    "Creating Kubernetes deployment...",
    "Configuring SSL certificate...",
    "Deployment ready"
  ]
}
```

**Status Values:**
- `pending`: Deployment queued
- `deploying`: In progress
- `completed`: Successfully deployed
- `failed`: Deployment failed

**Status Codes:**
- `200`: Success
- `404`: Job not found
- `500`: Internal server error

---

## Backend API Endpoints

### POST /deploy

Deploy a container to infrastructure.

**Request Body:**
```json
{
  "image_name": "ghcr.io/username/repo:latest",
  "app_name": "my-agent",
  "port": 8000,
  "registry_auth": "ghcr-secret"
}
```

**Response:**
```json
{
  "job_id": "deploy-abc123",
  "status": "pending",
  "message": "Deployment started",
  "estimated_time": "2-5 minutes"
}
```

---

### GET /status/[jobId]

Get deployment job status.

**Response:**
```json
{
  "job_id": "deploy-abc123",
  "status": "completed",
  "message": "Deployment successful",
  "url": "https://my-agent.0rca.live",
  "started_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:03:45Z",
  "logs": ["log line 1", "log line 2"]
}
```

---

## Agent API Endpoints

Each deployed agent must implement these endpoints.

### POST /start_job

Create a new job and return unsigned payment transactions.

**Request Body:**
```json
{
  "sender_address": "ALGORAND_ADDRESS",
  "job_input": "User input data or JSON"
}
```

**Response:**
```json
{
  "job_id": "job-abc123",
  "unsigned_group_txns": [
    "base64_encoded_payment_transaction",
    "base64_encoded_app_call_transaction"
  ],
  "txn_ids": ["TXN1_ID", "TXN2_ID"],
  "amount": 1000000,
  "receiver": "AGENT_CONTRACT_ADDRESS"
}
```

**Status Codes:**
- `200`: Job created
- `400`: Invalid input
- `500`: Internal error

---

### POST /submit_payment

Verify payment and grant access to job results.

**Request Body:**
```json
{
  "job_id": "job-abc123",
  "txid": ["TXN1_ID", "TXN2_ID"]
}
```

**Response:**
```json
{
  "status": "success",
  "access_token": "jwt_token_for_job_access",
  "message": "Payment verified, job started",
  "expires_at": "2024-01-01T01:00:00Z"
}
```

**Status Codes:**
- `200`: Payment verified
- `400`: Invalid transaction
- `402`: Payment not found or insufficient
- `409`: Transaction already used
- `500`: Verification failed

---

### GET /job/[job_id]

Get job status and results.

**Query Parameters:**
- `access_token` (required): Access token from payment verification

**Response (Pending):**
```json
{
  "job_id": "job-abc123",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Response (Running):**
```json
{
  "job_id": "job-abc123",
  "status": "running",
  "progress": 45,
  "created_at": "2024-01-01T00:00:00Z",
  "started_at": "2024-01-01T00:00:05Z"
}
```

**Response (Succeeded):**
```json
{
  "job_id": "job-abc123",
  "status": "succeeded",
  "output": "Job result data or JSON",
  "created_at": "2024-01-01T00:00:00Z",
  "started_at": "2024-01-01T00:00:05Z",
  "completed_at": "2024-01-01T00:01:30Z",
  "execution_time": 85
}
```

**Response (Failed):**
```json
{
  "job_id": "job-abc123",
  "status": "failed",
  "error": "Error message describing failure",
  "created_at": "2024-01-01T00:00:00Z",
  "started_at": "2024-01-01T00:00:05Z",
  "failed_at": "2024-01-01T00:00:30Z"
}
```

**Status Codes:**
- `200`: Success
- `401`: Invalid or expired access token
- `404`: Job not found
- `500`: Internal error

---

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Status Codes:**
- `200`: Service healthy
- `503`: Service unavailable

---

## Smart Contract Methods

### AgentsContract (749655317)

#### createAgent

Create a new agent on the blockchain.

**Method Signature:**
```
createAgent(string,string,uint64,string)uint64
```

**Parameters:**
- `agentName` (string): Agent display name
- `agentIPFS` (string): Agent URL or IPFS hash
- `pricing` (uint64): Price in microAlgos
- `agentImage` (string): Metadata or image reference

**Returns:**
- `uint64`: Created agent contract ID

**Transaction Requirements:**
- Fee: 0.02 ALGO (static fee)
- Sender must have sufficient balance

---

#### deleteAgent

Delete an agent from the blockchain.

**Method Signature:**
```
deleteAgent(uint64)void
```

**Parameters:**
- `agentId` (uint64): Agent contract ID to delete

**Authorization:**
- Only contract creator can delete agents

---

### LoggingContract (749653154)

#### emit_log

Log an event to the blockchain.

**Method Signature:**
```
emit_log(string,uint64,string)void
```

**Parameters:**
- `eventName` (string): Event type (e.g., "createAgent")
- `agentID` (uint64): Related agent ID
- `status` (string): Event status (e.g., "success")

---

## Error Codes

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `402`: Payment Required
- `404`: Not Found
- `405`: Method Not Allowed
- `409`: Conflict
- `500`: Internal Server Error
- `503`: Service Unavailable

### Custom Error Codes

```json
{
  "error": "INSUFFICIENT_PAYMENT",
  "message": "Payment amount is less than required",
  "required": 1000000,
  "received": 500000
}
```

**Error Codes:**
- `INSUFFICIENT_PAYMENT`: Payment too low
- `INVALID_TRANSACTION`: Transaction format invalid
- `TRANSACTION_NOT_FOUND`: Transaction not on blockchain
- `TRANSACTION_ALREADY_USED`: Replay attack detected
- `INVALID_ACCESS_TOKEN`: Token expired or invalid
- `JOB_NOT_FOUND`: Job ID doesn't exist
- `DEPLOYMENT_FAILED`: Container deployment error
- `BLOCKCHAIN_ERROR`: Smart contract call failed

---

## Rate Limiting

### Marketplace API
- **Rate**: 100 requests per minute per IP
- **Header**: `X-RateLimit-Remaining`

### Agent API
- **Rate**: 10 job creations per minute per address
- **Rate**: 60 status checks per minute per job

**Rate Limit Response:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 60
}
```

**Status Code:** `429 Too Many Requests`

---

## Webhooks

### Deployment Status Webhook

Configure webhook URL to receive deployment status updates.

**Webhook Payload:**
```json
{
  "event": "deployment.completed",
  "job_id": "deploy-abc123",
  "status": "completed",
  "url": "https://my-agent.0rca.live",
  "timestamp": "2024-01-01T00:03:45Z"
}
```

**Events:**
- `deployment.started`
- `deployment.completed`
- `deployment.failed`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { AgentsContractClient } from '@/contracts/AgentContracts'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

// Initialize client
const algorand = AlgorandClient.testNet()
const client = new AgentsContractClient({
  appId: 749655317n,
  algorand,
  defaultSender: address,
  defaultSigner: signer
})

// Create agent
const result = await client.send.createAgent({
  args: {
    agentName: 'My Agent',
    agentIpfs: 'https://my-agent.0rca.live',
    pricing: 1000000,
    agentImage: 'metadata'
  },
  staticFee: AlgoAmount.Algo(0.02)
})

console.log('Agent ID:', result.return)
```

### Python

```python
from algosdk import transaction
from algosdk.v2client import algod

# Initialize client
algod_client = algod.AlgodClient("", "https://testnet-api.algonode.cloud")

# Create payment transaction
params = algod_client.suggested_params()
payment_txn = transaction.PaymentTxn(
    sender=sender_address,
    sp=params,
    receiver=agent_address,
    amt=1000000
)

# Sign and send
signed_txn = payment_txn.sign(private_key)
txid = algod_client.send_transaction(signed_txn)
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Number of results (max: 100, default: 20)
- `offset`: Skip N results (default: 0)

**Response Headers:**
```
X-Total-Count: 150
X-Page-Limit: 20
X-Page-Offset: 0
Link: <url?offset=20&limit=20>; rel="next"
```

---

## CORS

**Allowed Origins:**
- `https://*.0rca.live`
- `http://localhost:3000` (development)

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:**
- Content-Type, Authorization, X-Requested-With
