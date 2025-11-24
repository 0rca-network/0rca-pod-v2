from orca_agent_sdk import AgentConfig, AgentServer
from orca_agent_sdk.runtime import call_llm, run_tool

def handle_task(job_input: str) -> str:
    job = job_input
    resp_1763962010092 = call_llm("GPT-4", job)
    tool_1763962029442 = run_tool("API Call", resp_1763962010092)

if __name__ == "__main__":
    config = AgentConfig(
        agent_id="123456",
        receiver_address="CAKAMXJBMMNPGU3VCMK7PIJQQ2O7AMVQM24QSFWYHZ2PP5YAPYHSZT2NGI",
        price_microalgos=1000000,
    )
    AgentServer(config=config, handler=handle_task).run()