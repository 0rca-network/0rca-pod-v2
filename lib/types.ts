export interface AgentConfig {
    name: string;
    description: string;
    greeting: string;
    cdcApiKey?: string;
    cdcPrivateKey?: string;
    transferLimit?: string;
    timeout?: string;
    googleApiKey?: string;
    geminiApiKey?: string;
    vaultAddress?: string;
    tools?: any[];
    mcpServers?: any[];
    crewAITools?: string[];
}
