import { AgentConfig } from "./types"

export function generateCDCAgentCode(agentId: string, config: AgentConfig) {
    const name = config.name || agentId
    const model = "gemini/gemini-2.0-flash"
    const systemPrompt = config.description || "You are a helpful AI assistant."
    const vaultAddress = config.vaultAddress || ""

    let code = `import os
import sys
from dotenv import load_dotenv
from orca_agent_sdk import CryptoComAgent

# Load environment variables
load_dotenv()

def main():
    # Configuration from environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
    
    # Initialize tools list
    tools = ${JSON.stringify(config.tools || [])}

    # Initialize the Crypto.com Agent (x402 + CDC Backend)
    agent = CryptoComAgent(
        name="${name}",
        model="${model}",
        vault_address="${vaultAddress}",
        provider_api_key=api_key,
        
        # CDC Configuration
        cdc_api_key=os.getenv("CDC_API_KEY"),
        cdc_private_key=os.getenv("CDC_PRIVATE_KEY"),
        
        # Advanced Config
        transfer_limit=${config.transferLimit || -1},
        timeout=${config.timeout || 60},
        
        # Instructions
        instructions="""${systemPrompt}""",
        
        # Custom Tools
        tools=tools
    )
    print(f"[{agent.name}] Initialized Crypto.com Agent.")
    print(f"[{agent.name}] Local Identity: {agent.vault_address}")
    
    # Start the Server
    port = int(os.getenv("PORT", 8080))
    agent.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()
`
    return code
}

export function generateOrcaAgentCode(agentId: string, config: AgentConfig) {
    const name = config.name || agentId
    const model = "gemini/gemini-2.0-flash"
    const systemPrompt = config.description || "You are a helpful AI assistant."
    const vaultAddress = config.vaultAddress || ""

    let code = `import os
import sys
from dotenv import load_dotenv
from orca_agent_sdk.agent import OrcaAgent

# Load environment variables
load_dotenv()

def main():
    # Configuration from environment
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
    
    # Initialize tools list (MCP and Custom API Tools)
    tools = []\n`

    if (config.mcpServers) {
        config.mcpServers.forEach(mcp => {
            code += `    tools.append({"name": "${mcp.name}", "url": "${mcp.url}"})\n`
        })
    }

    if (config.tools) {
        config.tools.forEach(tool => {
            // Simplified tool representation for the SDK
            code += `    tools.append({
        "name": "${tool.name}",
        "description": "${tool.description}",
        "api_config": {
            "url": "${tool.baseUrl}${tool.endpoint}",
            "method": "${tool.method}",
            "params": ${JSON.stringify(tool.parameters || [])}
        }
    })\n`
        })
    }

    const crewTools = config.crewAITools || []

    code += `
    # Initialize the Sovereign Agent (Standard)
    agent = OrcaAgent(
        name="${name}",
        model="${model}",
        system_prompt="""${systemPrompt}""",
        price="0.1",
        vault_address="${vaultAddress}",
        api_key=api_key,
        tools=tools + ${JSON.stringify(crewTools)}
    )
    print(f"[{agent.name}] Initialized Sovereign Agent with {len(agent.native_tools) + len(agent.mcps)} tools.")
    print(f"[{agent.name}] Local Identity: {agent.vault_address}")
    
    # Start the Server
    port = int(os.getenv("PORT", 8080))
    agent.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()
`
    return code
}
