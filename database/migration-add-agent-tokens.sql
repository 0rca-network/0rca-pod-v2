-- Add agent_token column to agents table
ALTER TABLE agents ADD COLUMN agent_token VARCHAR(64) UNIQUE;

-- Create access_tokens table
CREATE TABLE access_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  job_id VARCHAR(255) NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  access_token VARCHAR(255) NOT NULL,
  job_input_hash VARCHAR(255),
  job_output TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_access_tokens_agent_id ON access_tokens(agent_id);
CREATE INDEX idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX idx_access_tokens_job_id ON access_tokens(job_id);

-- Generate agent tokens for existing agents
UPDATE agents SET agent_token = encode(sha256(random()::text::bytea), 'hex') WHERE agent_token IS NULL;