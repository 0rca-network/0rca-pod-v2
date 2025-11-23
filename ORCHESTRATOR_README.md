# Orchestrator System

## Overview

The orchestrator enables multi-agent workflows where users can submit natural language requests, and the system automatically:
1. Plans a workflow using OpenAI
2. Executes agents sequentially
3. Passes outputs between steps
4. Handles blockchain payments via existing hire logic

## Architecture

### Core Components

**lib/orchestrator.ts** - Core orchestration logic
- `planWorkflow()` - Creates workflow using LLM
- `createAgentJob()` - Starts agent job
- `submitPayment()` - Verifies payment
- `pollAgentJob()` - Polls for results
- `advanceWorkflow()` - Moves to next step

**API Routes**
- `POST /api/workflows/create` - Create workflow from user message
- `POST /api/workflows/approve` - Approve workflow
- `POST /api/workflows/start` - Start execution
- `GET /api/workflows/[id]` - Get workflow status
- `POST /api/workflows/step/start_job` - Start step job
- `POST /api/workflows/step/submit_payment` - Submit payment
- `POST /api/workflows/step/poll` - Poll job results

**Frontend Pages**
- `/orchestrator` - User input page
- `/workflow/[workflow_id]` - Workflow execution & monitoring

## Database Schema

Uses existing tables:
- `workflows` - Workflow records
- `step_results` - Step execution state
- `jobs` - Job records
- `payments` - Payment records
- `access_tokens` - Agent access tokens

## Workflow Execution Flow

1. **User submits request** → `/orchestrator`
2. **LLM generates plan** → `POST /api/workflows/create`
3. **User approves** → Workflow page shows plan
4. **Sequential execution**:
   - Start job → Get unsigned txns
   - Frontend signs txns (reuses existing hire logic)
   - Submit payment
   - Poll for results
   - Advance to next step
5. **Completion** → Final output displayed

## Integration with Existing Hire Logic

The orchestrator **does not replace** the existing AgentDetail hire logic. Instead:

- Orchestrator calls agent `/start_job` endpoints
- Stores `unsigned_group_txns` in `step_results`
- Frontend uses **same transaction signing code** from AgentDetail
- After confirmation, orchestrator calls `/submit_payment`
- Polls agent for results

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Usage Example

User input:
```
"I have a headache and runny nose and want a movie recommendation"
```

LLM generates:
```json
{
  "reasoning": "User needs medical diagnosis then entertainment recommendation",
  "steps": [
    {
      "step_number": 1,
      "agent_id": "uuid-of-medical-agent",
      "agent_name": "Medical Diagnosis Agent",
      "description": "Diagnose symptoms",
      "input_data": {
        "symptoms": "headache, runny nose"
      }
    },
    {
      "step_number": 2,
      "agent_id": "uuid-of-movie-agent",
      "agent_name": "Movie Recommendation Agent",
      "description": "Recommend movies based on condition",
      "input_data": {
        "condition": "{{step_1_output}}"
      }
    }
  ]
}
```

## Error Handling

- Workflow cancellation → Update status to 'cancelled'
- Agent failure → Mark step as 'failed', halt workflow
- Timeout → Configurable polling timeout
- Partial completion → Resume from last successful step

## Type Safety

All types defined in `types/orchestrator.ts`:
- `WorkflowPlan`
- `WorkflowStep`
- `StepResult`
- `WorkflowRecord`
- `AgentMetadata`
- `JobRecord`
