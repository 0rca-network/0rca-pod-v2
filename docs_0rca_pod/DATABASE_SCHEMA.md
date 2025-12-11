# 0rca POD Marketplace - Database Schema Documentation

## Overview

The 0rca POD Marketplace uses Supabase (PostgreSQL) for data persistence. This document details the database schema, relationships, and access policies.

## Database: Supabase PostgreSQL

**Version:** PostgreSQL 15+  
**Extensions:** uuid-ossp, pgcrypto

## Tables

### agents

Stores information about deployed AI agents.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique agent identifier |
| user_id | UUID | FOREIGN KEY → auth.users(id), ON DELETE CASCADE | Owner of the agent |
| name | VARCHAR(255) | NOT NULL | Display name of the agent |
| description | TEXT | NULL | Detailed description |
| subdomain | VARCHAR(100) | UNIQUE, NOT NULL | Subdomain for agent URL |
| repo_owner | VARCHAR(255) | NOT NULL | GitHub repository owner |
| repo_name | VARCHAR(255) | NOT NULL | GitHub repository name |
| github_url | TEXT | NOT NULL | Full GitHub repository URL |
| agent_address | VARCHAR(58) | NULL | Algorand contract address |
| app_id | BIGINT | NULL | Algorand application ID |
| agent_token | VARCHAR(64) | NULL | SHA256 access token |
| price_microalgo | BIGINT | DEFAULT 1000000 | Price in microAlgos |
| status | VARCHAR(50) | DEFAULT 'pending' | Agent status |
| runtime_status | VARCHAR(50) | DEFAULT 'pending' | Runtime health status |
| category | VARCHAR(100) | DEFAULT 'General' | Agent category |
| tags | TEXT[] | NULL | Array of tags |
| data_input | TEXT | NULL | Expected input format |
| example_input | TEXT | NULL | Example input JSON |
| example_output | TEXT | NULL | Example output JSON |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_subdomain ON agents(subdomain);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_category ON agents(category);
CREATE UNIQUE INDEX idx_agents_user_repo ON agents(user_id, repo_owner, repo_name);
```

**Constraints:**
```sql
ALTER TABLE agents ADD CONSTRAINT unique_user_repo 
  UNIQUE (user_id, repo_owner, repo_name);
```

**Status Values:**
- `pending`: Agent created, awaiting deployment
- `deploying`: Container deployment in progress
- `active`: Agent deployed and operational
- `inactive`: Agent stopped or paused
- `failed`: Deployment or runtime failure
- `deleted`: Soft deleted

**Category Values:**
- Data Analysis
- Content Creation
- Development
- Finance
- Social Media
- Media
- Language
- Marketing
- General

---

### deployments

Tracks deployment history and status for agents.

**Table Structure:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique deployment identifier |
| agent_id | UUID | FOREIGN KEY → agents(id), ON DELETE CASCADE | Associated agent |
| job_id | VARCHAR(255) | NULL | Backend deployment job ID |
| status | VARCHAR(50) | DEFAULT 'pending' | Deployment status |
| build_logs | TEXT | NULL | Build and deployment logs |
| deployment_summary | TEXT | NULL | Summary of deployment |
| started_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Deployment start time |
| completed_at | TIMESTAMP WITH TIME ZONE | NULL | Deployment completion time |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation time |

**Indexes:**
```sql
CREATE INDEX idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_job_id ON deployments(job_id);
```

**Status Values:**
- `pending`: Deployment queued
- `deploying`: In progress
- `success`: Successfully deployed
- `failed`: Deployment failed
- `cancelled`: Deployment cancelled

---

### auth.users (Supabase Auth)

Built-in Supabase authentication table.

**Relevant Columns:**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User identifier |
| email | VARCHAR | User email |
| encrypted_password | VARCHAR | Hashed password |
| email_confirmed_at | TIMESTAMP | Email verification time |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**OAuth Identities:**
- GitHub OAuth provider configured
- Provider token stored for API access

---

## Relationships

```
auth.users (1) ──────< (N) agents
                         │
                         │
                         └──────< (N) deployments
```

### One-to-Many: users → agents
- One user can own multiple agents
- Cascade delete: Deleting user removes all their agents

### One-to-Many: agents → deployments
- One agent can have multiple deployment records
- Cascade delete: Deleting agent removes deployment history

---

## Row Level Security (RLS)

### agents Table Policies

#### SELECT Policy: "Users can view own agents"
```sql
CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT 
  USING (auth.uid() = user_id);
```

**Effect:** Users can only query their own agents.

#### INSERT Policy: "Users can insert own agents"
```sql
CREATE POLICY "Users can insert own agents" ON agents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

**Effect:** Users can only create agents for themselves.

#### UPDATE Policy: "Users can update own agents"
```sql
CREATE POLICY "Users can update own agents" ON agents
  FOR UPDATE 
  USING (auth.uid() = user_id);
```

**Effect:** Users can only modify their own agents.

#### DELETE Policy: "Users can delete own agents"
```sql
CREATE POLICY "Users can delete own agents" ON agents
  FOR DELETE 
  USING (auth.uid() = user_id);
```

**Effect:** Users can only delete their own agents.

---

### deployments Table Policies

#### SELECT Policy: "Users can view own deployments"
```sql
CREATE POLICY "Users can view own deployments" ON deployments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = deployments.agent_id 
      AND agents.user_id = auth.uid()
    )
  );
```

**Effect:** Users can only view deployments for their agents.

#### INSERT Policy: "Users can insert deployments for own agents"
```sql
CREATE POLICY "Users can insert deployments for own agents" ON deployments
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = deployments.agent_id 
      AND agents.user_id = auth.uid()
    )
  );
```

**Effect:** Users can only create deployment records for their agents.

---

## Migrations

### Migration History

1. **schema.sql** - Initial schema
   - Created agents and deployments tables
   - Set up RLS policies
   - Created indexes

2. **migration-add-category.sql** - Add category field
   ```sql
   ALTER TABLE agents ADD COLUMN category VARCHAR(100) DEFAULT 'General';
   CREATE INDEX idx_agents_category ON agents(category);
   ```

3. **migration-add-input-output.sql** - Add I/O examples
   ```sql
   ALTER TABLE agents ADD COLUMN data_input TEXT;
   ALTER TABLE agents ADD COLUMN example_input TEXT;
   ALTER TABLE agents ADD COLUMN example_output TEXT;
   ```

4. **migration-add-agent-tokens.sql** - Add blockchain fields
   ```sql
   ALTER TABLE agents ADD COLUMN agent_address VARCHAR(58);
   ALTER TABLE agents ADD COLUMN app_id BIGINT;
   ALTER TABLE agents ADD COLUMN agent_token VARCHAR(64);
   ```

5. **migration_add_job_id.sql** - Add deployment job tracking
   ```sql
   ALTER TABLE deployments ADD COLUMN job_id VARCHAR(255);
   CREATE INDEX idx_deployments_job_id ON deployments(job_id);
   ```

---

## Queries

### Common Queries

#### Get all agents for a user
```sql
SELECT * FROM agents 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

#### Get agent with deployment history
```sql
SELECT 
  a.*,
  json_agg(d.*) as deployments
FROM agents a
LEFT JOIN deployments d ON d.agent_id = a.id
WHERE a.id = $1
GROUP BY a.id;
```

#### Get active agents by category
```sql
SELECT * FROM agents 
WHERE status = 'active' 
AND category = $1
ORDER BY created_at DESC
LIMIT 20;
```

#### Get recent deployments
```sql
SELECT 
  d.*,
  a.name as agent_name,
  a.subdomain
FROM deployments d
JOIN agents a ON a.id = d.agent_id
WHERE a.user_id = auth.uid()
ORDER BY d.started_at DESC
LIMIT 10;
```

#### Search agents by tags
```sql
SELECT * FROM agents
WHERE tags && ARRAY[$1, $2]  -- Overlaps with provided tags
AND status = 'active'
ORDER BY created_at DESC;
```

---

## Triggers

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Effect:** Automatically updates `updated_at` timestamp on agent modifications.

---

## Views

### active_agents_view

Simplified view of active agents for public listing.

```sql
CREATE VIEW active_agents_view AS
SELECT 
  id,
  name,
  description,
  subdomain,
  repo_owner,
  category,
  tags,
  price_microalgo,
  created_at
FROM agents
WHERE status = 'active'
AND runtime_status = 'active';
```

---

## Functions

### get_agent_stats

Returns statistics for an agent.

```sql
CREATE OR REPLACE FUNCTION get_agent_stats(agent_uuid UUID)
RETURNS TABLE (
  total_deployments BIGINT,
  successful_deployments BIGINT,
  failed_deployments BIGINT,
  last_deployment_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_deployments,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_deployments,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_deployments,
    MAX(started_at) as last_deployment_at
  FROM deployments
  WHERE agent_id = agent_uuid;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```sql
SELECT * FROM get_agent_stats('agent-uuid-here');
```

---

## Backup and Recovery

### Backup Strategy

**Automated Backups (Supabase):**
- Daily automated backups
- Point-in-time recovery (PITR)
- 7-day retention for free tier
- 30-day retention for paid tiers

**Manual Backup:**
```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres -s dbname > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -a dbname > data.sql

# Full backup
pg_dump -h db.xxx.supabase.co -U postgres dbname > full_backup.sql
```

### Recovery

```bash
# Restore schema
psql -h db.xxx.supabase.co -U postgres dbname < schema.sql

# Restore data
psql -h db.xxx.supabase.co -U postgres dbname < data.sql
```

---

## Performance Optimization

### Index Usage

Monitor index usage:
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Query Performance

Analyze slow queries:
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Table Statistics

```sql
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

---

## Data Integrity

### Constraints Summary

- **Primary Keys**: All tables have UUID primary keys
- **Foreign Keys**: Cascade delete for referential integrity
- **Unique Constraints**: Subdomain, user+repo combination
- **Check Constraints**: None currently (consider adding for status values)
- **Not Null**: Critical fields like name, subdomain, repo info

### Recommended Check Constraints

```sql
-- Validate status values
ALTER TABLE agents ADD CONSTRAINT check_agent_status
  CHECK (status IN ('pending', 'deploying', 'active', 'inactive', 'failed', 'deleted'));

-- Validate price is positive
ALTER TABLE agents ADD CONSTRAINT check_price_positive
  CHECK (price_microalgo >= 0);

-- Validate subdomain format
ALTER TABLE agents ADD CONSTRAINT check_subdomain_format
  CHECK (subdomain ~ '^[a-z0-9-]+$');
```

---

## Security Best Practices

1. **Use RLS**: Always enable Row Level Security
2. **Service Role Key**: Only use server-side for admin operations
3. **Anon Key**: Use for client-side operations with RLS
4. **JWT Validation**: Verify tokens on API routes
5. **Input Sanitization**: Validate all user inputs
6. **Prepared Statements**: Prevent SQL injection
7. **Audit Logging**: Track sensitive operations
8. **Regular Backups**: Automated daily backups
9. **Access Control**: Limit database access to necessary services
10. **Encryption**: Use SSL/TLS for all connections
