-- Agents table: The core DNA of every autonomous agent
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  
  -- GitHub Repository Info
  repo_owner VARCHAR(255),
  repo_name VARCHAR(255),
  github_url TEXT,
  
  -- Configuration DNA (Store tools, prompts, and settings in JSONB for scalability)
  configuration JSONB DEFAULT '{
    "role": "",
    "goal": "",
    "skills": [],
    "constraints": [],
    "greeting": "Hello! I am your AI agent. How can I assist you today?",
    "shortcuts": [],
    "tools": [],
    "mcp_servers": [],
    "auth_method": "None"
  }'::jsonb,
  
  -- Inference API & Backend Deployment (Kubernetes / Docker)
  -- This section tracks the live state of the agent's hosted instance
  image_url TEXT,              -- Container image (e.g., ghcr.io/user/repo:latest)
  inference_url TEXT,          -- The live API endpoint for the agent
  k8s_deployment_name TEXT,    -- Name of the deployment in Kubernetes
  k8s_service_name TEXT,       -- Name of the k8s service
  k8s_namespace TEXT DEFAULT 'agents',
  port INTEGER DEFAULT 8000,
  cpu_limit TEXT DEFAULT '500m',
  memory_limit TEXT DEFAULT '1Gi',
  
  -- Web3 & On-Chain Registry (EIP-8004)
  ipfs_cid TEXT,               -- IPFS Hash from Pinata
  chain_agent_id TEXT,         -- The registration ID from the smart contract
  contract_address TEXT,       -- The IdentityRegistry used for this agent
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'pending', -- pending, building, active, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments table: Tracking every build and rollout
CREATE TABLE deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Build & Job Info
  job_id VARCHAR(255),         -- External job ID from CI/CD or K8s
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Logs & Output
  build_logs TEXT,
  deployment_summary JSONB,    -- Detailed stats about the deployment
  
  -- Timeline
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Logs / Analytics: For scaling and monitoring
CREATE TABLE agent_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID, -- Optional: track which user interacted
  action VARCHAR(100), -- "chat", "tool_call", "api_request"
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for blazing fast lookups and scalability
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_subdomain ON agents(subdomain);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_usage_agent_id ON agent_usage_logs(agent_id);

-- Row Level Security (RLS) Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;

-- Agents: Users can only see and modify their own agents
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents" ON agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents" ON agents
  FOR DELETE USING (auth.uid() = user_id);

-- Deployments: Same as agents
CREATE POLICY "Users can view own deployments" ON deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert deployments for own agents" ON deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Read-only for users
CREATE POLICY "Users can view own agent logs" ON agent_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_usage_logs.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();