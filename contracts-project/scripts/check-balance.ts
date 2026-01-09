import { ethers } from "ethers";

async function main() {
    const url = "http://127.0.0.1:7545";
    console.log(`Connecting to ${url}...`);
    try {
        const provider = new ethers.JsonRpcProvider(url);
        const net = await provider.getNetwork();
        console.log(`Connected to Chain ID: ${net.chainId}`);

        const mnemonic = "desk cherry minimum online robot truth order silly pool isolate post subway";
        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
        console.log(`Address: ${wallet.address}`);

        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

        if (balance === 0n) {
            console.error("❌ Balance is 0! Deployment will fail.");
        } else {
            console.log("✅ Sufficient funds likely.");
        }

    } catch (e: any) {
        console.error("❌ Connection failed:", e.message);
    }
}

main().catch(console.error);
