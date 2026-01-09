'use server';

/**
 * Manually fetches tools from an MCP server using raw JSON-RPC.
 * This bypasses SDK-specific handshake issues and works better with servers 
 * that have strict or non-standard connection requirements.
 */
export async function fetchMcpTools(
    url: string,
    transportType: 'http' | 'sse' = 'http',
    headers?: Record<string, string>
) {
    try {
        console.log(`[MCP Debug] Manually fetching tools from ${url}...`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                ...headers,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/list",
                params: {},
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText.slice(0, 100)}`);
        }

        const responseText = await response.text();
        console.log(`[MCP Debug] Raw Response (first 1000 chars): ${responseText.slice(0, 1000)}`);

        let data: any;

        // More robust SSE parsing: split into lines and find data: lines
        const lines = responseText.split('\n');
        const dataLines = lines.filter(line => line.trim().startsWith('data:'));

        if (dataLines.length > 0) {
            console.log(`[MCP Debug] Found ${dataLines.length} data: lines. Attempting to parse first one.`);
            for (const line of dataLines) {
                try {
                    const jsonStr = line.substring(line.indexOf('data:') + 5).trim();
                    if (jsonStr) {
                        data = JSON.parse(jsonStr);
                        console.log("[MCP Debug] Successfully parsed JSON from data: line.");
                        break; // Stop at first valid JSON
                    }
                } catch (e) {
                    console.warn("[MCP Debug] Skipping invalid JSON in data: line");
                }
            }
        }

        // If not successfully parsed as SSE, try parsing the whole thing as standard JSON
        if (!data) {
            try {
                data = JSON.parse(responseText);
                console.log("[MCP Debug] Successfully parsed as standard JSON.");
            } catch (e) {
                // If it still failed, we already have the raw response logged
                throw new Error("Failed to parse response as JSON or SSE. Check server console logs.");
            }
        }

        if (data.error) {
            throw new Error(data.error.message || "MCP Server Error");
        }

        if (!data.result || !data.result.tools) {
            console.log("[MCP Debug] Data received:", JSON.stringify(data).slice(0, 200));
            throw new Error("Invalid MCP response: 'result.tools' not found");
        }

        const tools = data.result.tools.map((tool: any) => ({
            name: tool.name,
            description: tool.description || '',
            inputSchema: tool.inputSchema || tool.parameters || {}
        }));

        console.log(`[MCP Debug] Successfully fetched ${tools.length} tools manually.`);

        return {
            success: true,
            tools: tools
        };
    } catch (error: any) {
        console.error(`[MCP Debug] Manual Fetch Error: ${error.message}`);
        return {
            success: false,
            error: error.message || "Failed to reach MCP server manually."
        };
    }
}
