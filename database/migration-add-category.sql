-- Add category column to agents table
ALTER TABLE agents ADD COLUMN category VARCHAR(50) DEFAULT 'General';

-- Add tags column to agents table (JSON array)
ALTER TABLE agents ADD COLUMN tags JSONB DEFAULT '[]';

-- Add agent_token column to store SHA256 hash
ALTER TABLE agents ADD COLUMN agent_token VARCHAR(64);

-- Create index on category for better query performance
CREATE INDEX idx_agents_category ON agents(category);

-- Update existing agents to have a default category
UPDATE agents SET category = 'General' WHERE category IS NULL;