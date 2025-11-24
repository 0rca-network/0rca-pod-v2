import { createClient } from '@supabase/supabase-js';
import { WorkflowPlan, WorkflowStep, AgentMetadata, StepResult } from '@/types/orchestrator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function planWorkflow(userMessage: string, walletAddress: string): Promise<{ workflow_id: string; plan: WorkflowPlan }> {
  const agents = await getActiveAgents();
  const plan = await generateWorkflowPlan(userMessage, agents);
  
  const { data, error } = await supabase
    .from('workflows')
    .insert({
      user_message: userMessage,
      wallet_address: walletAddress,
      plan,
      status: 'planned'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  for (const step of plan.steps) {
    await supabase.from('step_results').insert({
      workflow_id: data.workflow_id,
      step_number: step.step_number,
      agent_id: step.agent_id,
      agent_name: step.agent_name,
      status: 'pending'
    });
  }
  
  return { workflow_id: data.workflow_id, plan };
}

export async function approveWorkflow(workflowId: string) {
  const { error } = await supabase
    .from('workflows')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('workflow_id', workflowId);
  
  if (error) throw error;
}

export async function startWorkflow(workflowId: string) {
  const { error } = await supabase
    .from('workflows')
    .update({ status: 'running', current_step: 1, updated_at: new Date().toISOString() })
    .eq('workflow_id', workflowId);
  
  if (error) throw error;
}

export async function createAgentJob(workflowId: string, stepNumber: number, walletAddress: string) {
  const { data: workflow } = await supabase
    .from('workflows')
    .select('plan')
    .eq('workflow_id', workflowId)
    .single();
  
  const { data: stepResult } = await supabase
    .from('step_results')
    .select('*, agent:agents(*)')
    .eq('workflow_id', workflowId)
    .eq('step_number', stepNumber)
    .single();
  
  if (!stepResult || !workflow) throw new Error('Step not found');
  
  const step = workflow.plan.steps.find((s: WorkflowStep) => s.step_number === stepNumber);
  let inputData = step.input_data;
  
  if (stepNumber > 1) {
    const { data: prevStep } = await supabase
      .from('step_results')
      .select('output')
      .eq('workflow_id', workflowId)
      .eq('step_number', stepNumber - 1)
      .single();
    
    if (prevStep?.output) {
      inputData = { ...inputData, previous_output: prevStep.output };
    }
  }
  
  // Convert inputData to string if agent expects string input
  let jobInput = inputData;
  if (stepResult.agent.example_input && typeof stepResult.agent.example_input === 'string') {
    try {
      JSON.parse(stepResult.agent.example_input);
    } catch {
      // example_input is a plain string, so convert our object to string
      jobInput = JSON.stringify(inputData);
    }
  }
  
  const response = await fetch(`https://${stepResult.agent.subdomain}.0rca.live/start_job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_address: walletAddress,
      job_input: jobInput
    })
  });
  
  if (!response.ok) {
    throw new Error(`Agent returned ${response.status}: ${await response.text()}`);
  }
  
  const jobData = await response.json();
  
  if (!jobData.job_id || !jobData.unsigned_group_txns) {
    throw new Error('Invalid response from agent: missing job_id or unsigned_group_txns');
  }
  
  await supabase
    .from('step_results')
    .update({
      agent_job_id: jobData.job_id,
      unsigned_group_txns: jobData.unsigned_group_txns,
      status: 'awaiting_payment'
    })
    .eq('id', stepResult.id);
  
  return { stepResultId: stepResult.id, jobData };
}

export async function submitPayment(stepResultId: string, txnIds: string[]) {
  const { data: stepResult } = await supabase
    .from('step_results')
    .select('*, agent:agents(*)')
    .eq('id', stepResultId)
    .single();
  
  if (!stepResult) throw new Error('Step not found');
  
  const response = await fetch(`https://${stepResult.agent.subdomain}.0rca.live/submit_payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_id: stepResult.agent_job_id,
      txid: txnIds
    })
  });
  
  const paymentData = await response.json();
  
  await supabase
    .from('step_results')
    .update({
      access_token: paymentData.access_token,
      txn_ids: txnIds,
      status: 'payment_confirmed'
    })
    .eq('id', stepResultId);
  
  return paymentData;
}

export async function pollAgentJob(stepResultId: string): Promise<{ status: string; output?: string }> {
  const { data: stepResult } = await supabase
    .from('step_results')
    .select('*, agent:agents(*)')
    .eq('id', stepResultId)
    .single();
  
  if (!stepResult) throw new Error('Step not found');
  
  const response = await fetch(
    `https://${stepResult.agent.subdomain}.0rca.live/job/${stepResult.agent_job_id}?access_token=${stepResult.access_token}`
  );
  
  const resultData = await response.json();
  
  if (resultData.status === 'succeeded') {
    await supabase
      .from('step_results')
      .update({
        status: 'succeeded',
        output: resultData.output,
        completed_at: new Date().toISOString()
      })
      .eq('id', stepResultId);
    
    return { status: 'succeeded', output: resultData.output };
  } else if (resultData.status === 'failed') {
    await supabase
      .from('step_results')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', stepResultId);
    
    return { status: 'failed' };
  }
  
  await supabase
    .from('step_results')
    .update({ status: 'running' })
    .eq('id', stepResultId);
  
  return { status: resultData.status };
}

export async function advanceWorkflow(workflowId: string) {
  const { data: workflow } = await supabase
    .from('workflows')
    .select('current_step, plan')
    .eq('workflow_id', workflowId)
    .single();
  
  if (!workflow) throw new Error('Workflow not found');
  
  const totalSteps = workflow.plan.steps.length;
  
  if (workflow.current_step >= totalSteps) {
    await supabase
      .from('workflows')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('workflow_id', workflowId);
    return { completed: true };
  }
  
  await supabase
    .from('workflows')
    .update({ current_step: workflow.current_step + 1, updated_at: new Date().toISOString() })
    .eq('workflow_id', workflowId);
  
  return { completed: false, nextStep: workflow.current_step + 1 };
}

async function getActiveAgents(): Promise<AgentMetadata[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('id, name, description, subdomain, category, tags, data_input, example_input, example_output, status')
    .eq('status', 'active');
  
  if (error) throw error;
  return data || [];
}

async function generateWorkflowPlan(userMessage: string, agents: AgentMetadata[]): Promise<WorkflowPlan> {
  const prompt = buildLLMPrompt(userMessage, agents);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a workflow orchestrator. Analyze user requests and create multi-step agent workflows. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const plan = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  
  return plan;
}

function buildLLMPrompt(userMessage: string, agents: AgentMetadata[]): string {
  return `User request: "${userMessage}"

Available agents:
${agents.map(a => `
- ID: ${a.id}
  Name: ${a.name}
  Description: ${a.description}
  Category: ${a.category}
  Tags: ${a.tags.join(', ')}
  Input format: ${a.data_input}
  Example input: ${a.example_input}
  Example output: ${a.example_output}
`).join('\n')}

Create a workflow plan that:
1. Identifies which agents are needed
2. Orders them sequentially
3. Defines input for each step matching the agent's example_input format EXACTLY
4. Passes outputs between steps

IMPORTANT: The input_data for each step MUST match the format shown in the agent's example_input.
If example_input is a string, input_data should be a simple object that will be stringified.
If example_input is JSON, input_data should match that JSON structure.

Return JSON:
{
  "reasoning": "explanation of workflow",
  "steps": [
    {
      "step_number": 1,
      "agent_id": "uuid",
      "agent_name": "name",
      "description": "what this step does",
      "input_schema": {},
      "input_data": {}
    }
  ]
}`;
}
