export interface WorkflowStep {
  step_number: number;
  agent_id: string;
  agent_name: string;
  description: string;
  input_schema: any;
  input_data: any;
}

export interface WorkflowPlan {
  reasoning: string;
  steps: WorkflowStep[];
}

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  category: string;
  tags: string[];
  data_input: string;
  example_input: string;
  example_output: string;
  status: string;
}

export interface StepResult {
  id: string;
  workflow_id: string;
  step_number: number;
  agent_id: string;
  agent_name: string;
  agent_job_id?: string;
  status: string;
  output?: string;
  access_token?: string;
  txn_ids?: string[];
  unsigned_group_txns?: string[];
  completed_at?: string;
  agent?: any;
}

export interface WorkflowRecord {
  workflow_id: string;
  user_message: string;
  wallet_address: string;
  plan: WorkflowPlan;
  status: string;
  current_step: number;
  created_at: string;
  updated_at: string;
}
