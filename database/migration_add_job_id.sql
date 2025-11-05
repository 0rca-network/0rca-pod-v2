-- Migration: Add job_id column to deployments table
-- Run this in Supabase SQL Editor

ALTER TABLE deployments ADD COLUMN job_id VARCHAR(255);

-- Add index for job_id for better performance
CREATE INDEX idx_deployments_job_id ON deployments(job_id);