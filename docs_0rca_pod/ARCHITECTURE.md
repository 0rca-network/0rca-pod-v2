# 0rca POD Marketplace - Architecture Documentation

## System Overview

The 0rca POD Marketplace is a decentralized AI agent marketplace built on the Algorand blockchain. It enables developers to deploy AI agents as containerized services and allows users to discover, demo, and hire these agents using cryptocurrency payments.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.1.3 (React 18.2.0)
- **Styling**: Tailwind CSS 3.3.5
- **Language**: TypeScript 5.2.2
- **Wallet Integration**: @txnlab/use-wallet-react 4.3.1
- **Blockchain SDK**: algosdk 3.5.2, @algorandfoundation/algokit-utils 9.1.2

### Backend Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Container Orchestration**: Custom backend at backend.0rca.live
- **Blockchain**: Algorand TestNet

### Smart Contracts
- **AgentsContract**: Main contract for agent registry (App ID: 749655317)
- **LoggingContract**: Event logging contract (App ID: 749653154)
- **SingleAgentContract**: Individual agent contracts (dynamically created)

## Architecture Layers

### 1. Presentation Layer (Frontend)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
├─────────────────────────────────────────────────────────┤
│  Pages:                                                  │
│  - /pod (Marketplace)                                    │
│  - /pod/agents/[agentId] (Agent Details)                │
│  - /deploy (Agent Deployment)                            │
│  - /auth/callback (OAuth Callback)                       │
├─────────────────────────────────────────────────────────┤
│  Components:                                             │
│  - Layout (Header + Sidebar + Footer)                   │
│  - AgentCard (Agent Display)                            │
│  - DemoInputModal (Free Demo Interface)                 │
│  - DeploymentModal (Deployment Wizard)                  │
│  - ConnectWalletButton/Modal (Wallet Integration)       │
└─────────────────────────────────────────────────────────┘
```

### 2. API Layer (Next.js API Routes)

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes                            │
├─────────────────────────────────────────────────────────┤
│  /api/agents                                             │
│  - POST: Create/update agent records                     │
│  - Validates JWT tokens                                  │
│  - Manages agent metadata in Supabase                    │
├─────────────────────────────────────────────────────────┤
│  /api/agents/[id]                                        │
│  - GET: Fetch agent details by ID                        │
├─────────────────────────────────────────────────────────┤
│  /api/deploy                                             │
│  - POST: Trigger container deployment                    │
│  - Proxies to backend.0rca.live/deploy                   │
├─────────────────────────────────────────────────────────┤
│  /api/status/[jobId]                                     │
│  - GET: Check deployment status                          │
│  - Proxies to backend.0rca.live/status                   │
├─────────────────────────────────────────────────────────┤
│  /api/list-agents                                        │
│  - GET: List all active agents                           │
└─────────────────────────────────────────────────────────┘
```

### 3. Blockchain Layer

```
┌─────────────────────────────────────────────────────────┐
│              Algorand Smart Contracts                    │
├─────────────────────────────────────────────────────────┤
│  AgentsContract (749655317)                              │
│  - createAgent(): Creates new agent on-chain             │
│  - deleteAgent(): Removes agent                          │
│  - Stores: agent metadata, pricing, IPFS links           │
├─────────────────────────────────────────────────────────┤
│  LoggingContract (749653154)                             │
│  - emit_log(): Records events on-chain                   │
│  - Tracks: createAgent, deleteAgent events               │
├─────────────────────────────────────────────────────────┤
│  SingleAgentContract (Dynamic)                           │
│  - Created per agent deployment                          │
│  - Manages: job payments, access tokens                  │
│  - Handles: payment verification, job tracking           │
└─────────────────────────────────────────────────────────┘
```

### 4. Data Layer

```
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
├─────────────────────────────────────────────────────────┤
│  agents table:                                           │
│  - id, user_id, name, description                        │
│  - subdomain, repo_owner, repo_name                      │
│  - github_url, agent_address, app_id                     │
│  - agent_token, price_microalgo                          │
│  - status, runtime_status, category, tags                │
│  - data_input, example_input, example_output             │
├─────────────────────────────────────────────────────────┤
│  deployments table:                                      │
│  - id, agent_id, job_id, status                          │
│  - build_logs, deployment_summary                        │
│  - started_at, completed_at                              │
├─────────────────────────────────────────────────────────┤
│  RLS Policies:                                           │
│  - Users can only access their own agents                │
│  - Users can only see deployments for their agents       │
└─────────────────────────────────────────────────────────┘
```

### 5. Container Orchestration Layer

```
┌─────────────────────────────────────────────────────────┐
│              Backend Service (backend.0rca.live)         │
├─────────────────────────────────────────────────────────┤
│  POST /deploy                                            │
│  - Accepts: image_name, app_name, port                   │
│  - Pulls container from GitHub Container Registry        │
│  - Deploys to Kubernetes/Docker infrastructure           │
│  - Configures SSL certificates                           │
│  - Returns: job_id for tracking                          │
├─────────────────────────────────────────────────────────┤
│  GET /status/[jobId]                                     │
│  - Returns: deployment status, logs, errors              │
│  - States: pending, deploying, completed, failed         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Agent Deployment Flow

```
Developer → GitHub Auth → Select Repo → Configure Agent
    ↓
Step 1: Create on Blockchain
    ↓
Connect Wallet → Sign Transaction → AgentsContract.createAgent()
    ↓
Returns: AgentContractID, agentAddress, agentToken
    ↓
Step 2: Push Container
    ↓
Developer builds Docker image → Push to ghcr.io
    ↓
Enter container URL → Submit
    ↓
Step 3: Deploy Container
    ↓
API /deploy → backend.0rca.live → Pull & Deploy
    ↓
Poll /status → Wait for completion
    ↓
Create agent record in Supabase
    ↓
Agent Live at: https://[subdomain].0rca.live
```

### Agent Hiring Flow

```
User → Browse Marketplace → Select Agent → View Details
    ↓
Connect Wallet (Pera, Defly, Lute, Exodus)
    ↓
Click "Hire Agent"
    ↓
POST https://[subdomain].0rca.live/start_job
    ↓
Agent returns: unsigned_group_txns, job_id
    ↓
Wallet signs transactions (payment + app call)
    ↓
Submit to Algorand network
    ↓
Wait for confirmation
    ↓
POST https://[subdomain].0rca.live/submit_payment
    ↓
Agent verifies payment on-chain
    ↓
Returns: access_token
    ↓
Poll GET https://[subdomain].0rca.live/job/[job_id]
    ↓
Job Status: pending → running → succeeded/failed
    ↓
Display results to user
```

## Security Architecture

### Authentication
- GitHub OAuth via Supabase Auth
- JWT tokens for API authentication
- Row Level Security (RLS) in database

### Authorization
- User can only manage their own agents
- Wallet signature required for blockchain operations
- Agent tokens for API access control

### Payment Security
- On-chain payment verification
- Atomic transaction groups (payment + app call)
- Access tokens generated after payment confirmation
