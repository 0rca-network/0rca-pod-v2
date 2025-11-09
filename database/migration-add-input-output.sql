-- Add input/output columns to agents table
ALTER TABLE agents ADD COLUMN data_input TEXT;
ALTER TABLE agents ADD COLUMN example_input TEXT;
ALTER TABLE agents ADD COLUMN example_output TEXT;