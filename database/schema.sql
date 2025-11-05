-- Agents table
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  repo_owner VARCHAR(255) NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  github_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, repo_owner, repo_name)
);

-- Deployments table
CREATE TABLE deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  build_logs TEXT,
  deployment_summary TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_subdomain ON agents(subdomain);
CREATE INDEX idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX idx_deployments_status ON deployments(status);

-- RLS policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own agents
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents" ON agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see deployments for their agents
CREATE POLICY "Users can view own deployments" ON deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = deployments.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert deployments for own agents" ON deployments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = deployments.agent_id 
      AND agents.user_id = auth.uid()
    )
  );