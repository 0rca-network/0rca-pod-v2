import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Creating Test Agents on Localnet...");

    // 1. Connect to Localnet
    const url = "http://127.0.0.1:7545";
    const provider = new ethers.JsonRpcProvider(url);
    const mnemonic = "desk cherry minimum online robot truth order silly pool isolate post subway";
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    console.log(`Connected to ${url} as ${wallet.address}`);

    // 2. Load Deployed Addresses
    const addressFile = path.resolve(process.cwd(), "deployed_addresses.json");
    if (!fs.existsSync(addressFile)) {
        throw new Error("deployed_addresses.json not found. Run deployment first.");
    }
    const allAddresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    const addresses = allAddresses.ganache;

    if (!addresses) {
        throw new Error("No addresses found for ganache network.");
    }

    console.log("Using IdentityRegistry at:", addresses.identityRegistry);

    // 3. Register Agents
    // ABI for register function
    const abi = [
        "function register(string calldata tokenURI) external returns (uint256)"
    ];

    const identityContract = new ethers.Contract(addresses.identityRegistry, abi, wallet);

    const testAgents = [
        { name: "Local Agent Alpha", description: "First local agent" },
        { name: "Local Agent Beta", description: "Second local agent" },
        { name: "Local Agent Gamma", description: "Third local agent" }
    ];

    let currentNonce = await wallet.getNonce();
    console.log("Initial Nonce:", currentNonce);

    for (const agent of testAgents) {
        console.log(`Registering ${agent.name}... (Nonce: ${currentNonce})`);
        // We just use description as tokenURI for simplicity in this demo
        const tx = await identityContract.register(agent.description, {
            gasLimit: 500000,
            nonce: currentNonce++
        });
        await tx.wait();
        console.log(`  Tx: ${tx.hash}`);
    }

    console.log("✅ Successfully registered agents.");
}

main().catch(console.error);
