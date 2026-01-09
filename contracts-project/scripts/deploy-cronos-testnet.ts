import { ethers } from "ethers";
import * as hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Deploying non-upgradeable Registry Contracts to Cronos Testnet");
    const hh = (hre as any).default || hre;

    const url = "https://evm-t3.cronos.org";
    const mnemonic = "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle";
    const chainId = 338;
    const networkName = "cronosTestnet";

    const provider = new ethers.JsonRpcProvider(url);
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

    console.log("Deployer address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "TCRO");

    let currentNonce = await wallet.getNonce();

    async function deploy(name: string, args: any[] = []) {
        console.log(`Deploying ${name}... (Nonce: ${currentNonce})`);
        const artifact = await hh.artifacts.readArtifact(name);
        const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
        const contract = await factory.deploy(...args, {
            gasLimit: 6500000,
            nonce: currentNonce++
        });
        await contract.waitForDeployment();
        const addr = await contract.getAddress();
        console.log(`   ${name} deployed at:`, addr);
        return addr;
    }

    // 1. IdentityRegistry
    const identityAddr = await deploy("IdentityRegistry");

    // 2. ReputationRegistry
    const reputationAddr = await deploy("ReputationRegistry", [identityAddr]);

    // 3. ValidationRegistry
    const validationAddr = await deploy("ValidationRegistry", [identityAddr]);

    // 4. ContractRegistry
    const contractRegistryAddr = await deploy("ContractRegistry");

    // 5. Register in ContractRegistry
    console.log("Registering contracts in ContractRegistry...");
    const ContractRegistryArtifact = await hh.artifacts.readArtifact("ContractRegistry");
    const contractRegistry = new ethers.Contract(contractRegistryAddr, ContractRegistryArtifact.abi, wallet);

    await (await contractRegistry.setRegistry("AgentIdentityRegistry", identityAddr, { nonce: currentNonce++ })).wait();
    await (await contractRegistry.setRegistry("ReputationRegistry", reputationAddr, { nonce: currentNonce++ })).wait();
    await (await contractRegistry.setRegistry("ValidationRegistry", validationAddr, { nonce: currentNonce++ })).wait();
    console.log("Contracts registered.");

    // 6. Update deployed_addresses.json
    const addressFile = path.resolve(process.cwd(), "deployed_addresses.json");
    let allAddresses: any = {};
    if (fs.existsSync(addressFile)) {
        allAddresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    }

    allAddresses[networkName] = {
        identityRegistry: identityAddr,
        reputationRegistry: reputationAddr,
        validationRegistry: validationAddr,
        contractRegistry: contractRegistryAddr
    };

    fs.writeFileSync(addressFile, JSON.stringify(allAddresses, null, 2));
    console.log(`Addresses saved to ${addressFile}`);

    // 7. Update frontend lib
    const frontendAddressFile = path.resolve(process.cwd(), "../lib/contracts.json");
    let frontendAddresses: any = {};
    if (fs.existsSync(frontendAddressFile)) {
        frontendAddresses = JSON.parse(fs.readFileSync(frontendAddressFile, "utf8"));
    }
    frontendAddresses[networkName] = allAddresses[networkName];
    fs.writeFileSync(frontendAddressFile, JSON.stringify(frontendAddresses, null, 2));
    console.log(`Addresses saved to frontend: ${frontendAddressFile}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
