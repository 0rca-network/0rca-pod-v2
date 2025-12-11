# 0rca POD Marketplace - Deployment Guide

## Overview

This guide covers the complete deployment process for both the marketplace platform and individual AI agents.

## Prerequisites

### For Platform Deployment
- Node.js 20.x or higher
- npm or yarn package manager
- Supabase account
- GitHub OAuth App credentials
- Algorand wallet with TestNet ALGO

### For Agent Deployment
- Docker installed
- GitHub account with Container Registry access
- Algorand wallet connected
- Agent code repository

## Platform Deployment

### 1. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub OAuth (from Supabase Auth settings)
# Configure in Supabase Dashboard → Authentication → Providers → GitHub

# Algorand Configuration
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
NEXT_PUBLIC_AGENTS_CONTRACT_ID=749655317
NEXT_PUBLIC_LOGGING_CONTRACT_ID=749653154

# Backend Service
NEXT_PUBLIC_BACKEND_URL=http://backend.0rca.live
```

### 2. Database Setup

Run the database migrations in Supabase SQL Editor:

```sql
-- Run schema.sql
-- Creates agents and deployments tables with RLS policies

-- Run migration files in order:
-- 1. migration-add-category.sql
-- 2. migration-add-input-output.sql
-- 3. migration-add-agent-tokens.sql
-- 4. migration_add_job_id.sql
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build and Run

#### Development Mode
```bash
npm run dev
```
Access at http://localhost:3000

#### Production Build
```bash
npm run build
npm start
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

## Agent Deployment Process

### Step 1: Prepare Your Agent

#### Required Agent Structure

Your agent must expose these HTTP endpoints:

```
POST /start_job
- Input: { sender_address, job_input }
- Output: { job_id, unsigned_group_txns, txn_ids }

POST /submit_payment
- Input: { job_id, txid }
- Output: { status, access_token, message }

GET /job/{job_id}
- Query: ?access_token=xxx
- Output: { status, output, error }

GET /health
- Output: { status: "healthy" }
```

#### Example Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Build and Push Container

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build image
docker build -t ghcr.io/USERNAME/REPO:latest .

# Push to registry
docker push ghcr.io/USERNAME/REPO:latest
```

### Step 3: Deploy via Marketplace UI

1. **Navigate to Deploy Page**
   - Go to https://your-marketplace.com/deploy
   - Sign in with GitHub

2. **Select Repository**
   - Choose the repository containing your agent code
   - View repository details

3. **Configure Agent (Step 1: Blockchain)**
   - **Agent Name**: Display name for your agent
   - **Subdomain**: Unique subdomain (e.g., `my-agent` → `my-agent.0rca.live`)
   - **Category**: Select from predefined categories
   - **Tags**: Add relevant tags for categorization
   - **Description**: Detailed description of agent capabilities
   - **Data Input Format**: Expected input format (e.g., JSON schema)
   - **Example Input**: Sample input JSON
   - **Example Output**: Sample output JSON
   - **Connect Wallet**: Connect Algorand wallet
   - Click "Step 1: Create Agent on Blockchain"

4. **Blockchain Creation**
   - Transaction sent to AgentsContract
   - Creates SingleAgentContract for your agent
   - Returns:
     - `AgentContractID`: Your agent's contract ID
     - `agentAddress`: Contract address
     - `agentToken`: API access token

5. **Add Blockchain Data to Agent (Step 2)**
   - Copy the provided environment variables:
     ```bash
     AGENT_APP_ID=123456789
     AGENT_ADDRESS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     AGENT_TOKEN=abc123...
     ```
   - Add these to your agent's environment
   - Rebuild and push your Docker container
   - Enter container URL: `ghcr.io/USERNAME/REPO:latest`

6. **Deploy Container (Step 3)**
   - Click "Step 2: Deploy Container"
   - System sends deployment request to backend
   - Backend pulls container from registry
   - Deploys to infrastructure
   - Configures SSL certificate
   - Sets up subdomain routing

7. **Monitor Deployment**
   - Watch deployment logs in real-time
   - Status updates:
     - `pending`: Deployment queued
     - `deploying`: Container being deployed
     - `completed`: Agent live
     - `failed`: Deployment error

8. **Deployment Complete**
   - Agent accessible at: `https://[subdomain].0rca.live`
   - Listed in marketplace
   - Ready to accept jobs

## Deployment Architecture

### Container Deployment Flow

```
Developer → Push to ghcr.io
    ↓
Marketplace UI → /api/deploy
    ↓
backend.0rca.live/deploy
    ↓
┌─────────────────────────────────┐
│  Backend Orchestrator           │
│  1. Pull image from ghcr.io     │
│  2. Create Kubernetes deployment│
│  3. Create service & ingress    │
│  4. Configure SSL (Let's Encrypt)│
│  5. Update DNS records          │
└─────────────────────────────────┘
    ↓
Agent Live at https://subdomain.0rca.live
```

### Backend Deployment API

#### POST /deploy

**Request:**
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
  "message": "Deployment started"
}
```

#### GET /status/{job_id}

**Response:**
```json
{
  "job_id": "deploy-abc123",
  "status": "completed",
  "message": "Deployment successful",
  "url": "https://my-agent.0rca.live",
  "logs": ["Pulling image...", "Creating deployment...", "Ready"]
}
```

## Smart Contract Deployment

### AgentsContract Deployment

The main AgentsContract is already deployed at App ID: 749655317

To deploy a new instance:

```typescript
import { AgentsContractFactory } from '@/contracts/AgentContracts'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

const algorand = AlgorandClient.testNet()
const factory = new AgentsContractFactory({
  algorand,
  defaultSender: maintainerAddress,
  defaultSigner: transactionSigner
})

const { appClient } = await factory.deploy({
  createParams: {
    method: 'createApplication',
    args: { maintainerAddress }
  }
})

console.log('Contract deployed:', appClient.appId)
```

### SingleAgentContract Creation

Created automatically during agent deployment:

```typescript
const result = await appClient.send.createAgent({
  args: {
    agentName: 'My Agent',
    agentIpfs: 'https://my-agent.0rca.live',
    pricing: 1000000, // 1 ALGO in microAlgos
    agentImage: 'metadata'
  },
  sender: activeAddress,
  signer: transactionSigner,
  staticFee: AlgoAmount.Algo(0.02)
})

const agentContractId = result.return
```

## Infrastructure Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **Network**: 100Mbps

### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: 1Gbps
- **Load Balancer**: Nginx/Traefik
- **SSL**: Let's Encrypt auto-renewal

## Monitoring and Logging

### Application Logs
```bash
# View Next.js logs
npm run dev

# Production logs (Vercel)
vercel logs
```

### Container Logs
```bash
# View agent container logs
kubectl logs -f deployment/my-agent

# Or via backend API
curl http://backend.0rca.live/logs/my-agent
```

### Blockchain Events
- Monitor LoggingContract (749653154) for events
- Track agent creation/deletion events
- Verify payment transactions

## Troubleshooting

### Common Deployment Issues

#### 1. Container Won't Start
```bash
# Check container logs
docker logs container-id

# Verify port configuration
# Ensure EXPOSE 8000 in Dockerfile matches deployment port
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
curl -vI https://subdomain.0rca.live

# Force certificate renewal
# Contact backend administrator
```

#### 3. Blockchain Transaction Failures
```bash
# Check wallet balance
# Ensure sufficient ALGO for fees (min 0.1 ALGO)

# Verify contract ID
# Confirm using correct network (TestNet)

# Check transaction status
algoexplorer.io/tx/TRANSACTION_ID
```

#### 4. Database Connection Issues
```bash
# Verify Supabase credentials
# Check RLS policies
# Ensure user is authenticated
```

## Rollback Procedures

### Rollback Agent Deployment
1. Delete agent from marketplace UI
2. Remove container deployment
3. Delete DNS records
4. Optionally delete blockchain record

### Rollback Platform Update
```bash
# Vercel rollback
vercel rollback

# Or redeploy previous version
git checkout previous-commit
vercel --prod
```

## Security Checklist

- [ ] Environment variables secured
- [ ] Database RLS policies enabled
- [ ] SSL certificates configured
- [ ] GitHub OAuth properly configured
- [ ] Wallet connections use secure providers
- [ ] API routes validate authentication
- [ ] Container images scanned for vulnerabilities
- [ ] Rate limiting enabled on APIs
- [ ] CORS properly configured
- [ ] Secrets not committed to repository
