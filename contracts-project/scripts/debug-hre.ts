import * as hre from "hardhat";

async function main() {
    console.log("--- Debugging HRE ---");
    const hh = (hre as any).default || hre;

    console.log("DEBUG: Network Name:", hh.network?.name);
    console.log("DEBUG: Chain ID:", hh.network?.config?.chainId);
    console.log("DEBUG: Env Network:", process.env.HARDHAT_NETWORK);
    console.log("DEBUG: Config URL:", hh.network?.config?.url);
}

main().catch(console.error);
