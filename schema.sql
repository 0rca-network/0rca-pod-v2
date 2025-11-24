-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.access_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address character varying NOT NULL,
  job_id character varying NOT NULL,
  agent_id uuid,
  access_token character varying NOT NULL,
  job_input_hash character varying,
  job_output text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT access_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT access_tokens_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.agents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name character varying NOT NULL,
  description text,
  subdomain character varying NOT NULL UNIQUE,
  repo_owner character varying NOT NULL,
  repo_name character varying NOT NULL,
  github_url text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  agent_address text,
  app_id bigint,
  price_microalgo bigint DEFAULT 0,
  runtime_status text DEFAULT 'inactive'::text CHECK (runtime_status = ANY (ARRAY['active'::text, 'inactive'::text, 'error'::text, 'maintenance'::text])),
  category character varying DEFAULT 'General'::character varying,
  tags jsonb DEFAULT '[]'::jsonb,
  data_input text,
  example_input text,
  example_output text,
  agent_token character varying UNIQUE,
  CONSTRAINT agents_pkey PRIMARY KEY (id),
  CONSTRAINT agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.deployments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid,
  status character varying DEFAULT 'pending'::character varying,
  build_logs text,
  deployment_summary text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  job_id character varying,
  CONSTRAINT deployments_pkey PRIMARY KEY (id),
  CONSTRAINT deployments_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.jobs (
  job_id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid,
  requester_addr text NOT NULL,
  callee_addr text,
  job_input jsonb NOT NULL,
  job_input_hash text NOT NULL,
  amount_microalgo bigint,
  state text NOT NULL CHECK (state = ANY (ARRAY['prepared'::text, 'payment_pending'::text, 'onchain_confirmed'::text, 'running'::text, 'succeeded'::text, 'failed'::text, 'expired'::text, 'cancelled'::text])),
  txid text,
  group_id text,
  token_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (job_id),
  CONSTRAINT jobs_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.payments (
  payment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  agent_id uuid,
  payer_addr text NOT NULL,
  payee_addr text NOT NULL,
  amount_microalgo bigint NOT NULL,
  txid text NOT NULL,
  confirmed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id),
  CONSTRAINT payments_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.step_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid,
  step_number integer NOT NULL,
  agent_id uuid,
  job_id uuid,
  status text DEFAULT 'pending'::text,
  access_token text,
  output text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  agent_job_id text,
  agent_name text,
  unsigned_group_txns jsonb,
  txn_ids jsonb,
  CONSTRAINT step_results_pkey PRIMARY KEY (id),
  CONSTRAINT step_results_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(workflow_id),
  CONSTRAINT step_results_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id),
  CONSTRAINT step_results_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id)
);
CREATE TABLE public.tokens (
  token_id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  jwt_jti text UNIQUE,
  jwt_hash text,
  aud text,
  sub text,
  exp_at timestamp with time zone,
  revoked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tokens_pkey PRIMARY KEY (token_id),
  CONSTRAINT tokens_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id)
);
CREATE TABLE public.workflows (
  workflow_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  user_message text NOT NULL,
  wallet_address text NOT NULL,
  plan jsonb NOT NULL,
  current_step integer DEFAULT 0,
  status text DEFAULT 'planned'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workflows_pkey PRIMARY KEY (workflow_id),
  CONSTRAINT workflows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);