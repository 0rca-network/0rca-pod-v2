import { ethers } from "ethers";
import * as hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const _processEnv = (key: string) => process.env[key];
  console.log("Deploying ERC-8004 Upgradeable Contracts (Standalone Ethers ESM)");
  console.log("==============================================================");

  // Check if hre has network or if it is on default
  const hh = (hre as any).default || hre;

  // Debug HRE
  // console.log("HH Keys:", Object.keys(hh));

  // Default values
  // Default values
  let url = (hh.network && hh.network.config && hh.network.config.url) || "https://evm-t3.cronos.org";
  let mnemonic = "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle";
  const localMnemonic = "desk cherry minimum online robot truth order silly pool isolate post subway";

  let networkName = hh.network ? hh.network.name : (_processEnv('HARDHAT_NETWORK') || "unknown");

  // Probe for Ganache if needed
  if (!networkName || networkName === 'unknown' || networkName === 'undefined') {
    try {
      const probeProvider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const net = await probeProvider.getNetwork();
      if (net.chainId === 1337n || net.chainId === 5777n) {
        console.log("Detected Ganache! Switching to local.");
        url = "http://127.0.0.1:7545";
        networkName = "ganache";
      }
    } catch (e) {
      // ignore
    }
  }

  // Robustness check Chain ID if available from config
  const chainId = hh.network?.config?.chainId;
  if ((!networkName || networkName === 'unknown') && chainId === 1337) {
    networkName = 'ganache';
  }

  // Fallback for local run check
  if (networkName === 'undefined' && url.includes('127.0.0.1')) {
    networkName = 'ganache';
  }

  console.log("Resolved Network Name:", networkName);

  // Override for local
  if (networkName === 'ganache' || networkName === 'localhost' || chainId === 1337) {
    url = "http://127.0.0.1:7545";
    mnemonic = localMnemonic;
  }

  if (hh.network.config && hh.network.config.accounts && hh.network.config.accounts.mnemonic) {
    // If hardhat config has specific accounts for this network, use them.
    // But for 'ganache' network defined in config, we might have put the old mnemonic there.
    // Let's rely on our manual override for 'ganache' network name unless specific config exists and isn't default.
    if (networkName !== 'ganache') {
      mnemonic = hh.network.config.accounts.mnemonic;
    }
  }

  if (networkName === 'ganache' && !url.includes('127.0.0.1')) {
    console.warn("WARNING: Network is ganache but URL is not local!");
    url = "http://127.0.0.1:7545";
  }

  const provider = new ethers.JsonRpcProvider(url);
  const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

  console.log("Deployer address:", wallet.address);

  let currentNonce = await wallet.getNonce();
  console.log("Initial Nonce:", currentNonce);

  async function deploy(name: string, args: any[] = []) {
    console.log(`Deploying ${name}... (Nonce: ${currentNonce})`);
    const artifact = await hh.artifacts.readArtifact(name);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const contract = await factory.deploy(...args, {
      gasLimit: 6500000,
      nonce: currentNonce++
    });
    await contract.waitForDeployment();
    console.log(`   ${name} deployed at:`, contract.target);
    return contract;
  }

  // 1. IdentityRegistry
  console.log("1. Setup IdentityRegistry");
  const identityImpl = await deploy("IdentityRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const IdentityArtifact = await hh.artifacts.readArtifact("IdentityRegistryUpgradeable");
  const IdentityInterface = new ethers.Interface(IdentityArtifact.abi);
  const identityInitData = IdentityInterface.encodeFunctionData("initialize", []);

  const identityProxy = await deploy("ERC1967Proxy", [identityImpl.target, identityInitData]);

  // 2. ReputationRegistry
  console.log("2. Setup ReputationRegistry");
  const reputationImpl = await deploy("ReputationRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const ReputationArtifact = await hre.artifacts.readArtifact("ReputationRegistryUpgradeable");
  const ReputationInterface = new ethers.Interface(ReputationArtifact.abi);
  const reputationInitData = ReputationInterface.encodeFunctionData("initialize", [identityProxy.target]);

  const reputationProxy = await deploy("ERC1967Proxy", [reputationImpl.target, reputationInitData]);

  // 3. ValidationRegistry
  console.log("3. Setup ValidationRegistry");
  const validationImpl = await deploy("ValidationRegistryUpgradeable");

  console.log("   Deploying Proxy...");
  const ValidationArtifact = await hre.artifacts.readArtifact("ValidationRegistryUpgradeable");
  const ValidationInterface = new ethers.Interface(ValidationArtifact.abi);
  const validationInitData = ValidationInterface.encodeFunctionData("initialize", [identityProxy.target]);

  const validationProxy = await deploy("ERC1967Proxy", [validationImpl.target, validationInitData]);

  console.log("");
  console.log("Deployment Summary");
  console.log("==================");
  console.log("IdentityRegistry Proxy:", identityProxy.target);
  console.log("ReputationRegistry Proxy:", reputationProxy.target);
  console.log("ValidationRegistry Proxy:", validationProxy.target);

  // Save to file
  const addresses = {
    identityRegistry: identityProxy.target,
    reputationRegistry: reputationProxy.target,
    validationRegistry: validationProxy.target
  };

  const addressFile = path.resolve(process.cwd(), "deployed_addresses.json");
  let allAddresses: any = {};
  if (fs.existsSync(addressFile)) {
    allAddresses = JSON.parse(fs.readFileSync(addressFile, "utf8"));
  }

  allAddresses[networkName] = addresses;
  fs.writeFileSync(addressFile, JSON.stringify(allAddresses, null, 2));
  console.log(`Addresses saved to ${addressFile}`);

  // Also save to frontend lib
  // contracts-project is one level deep. frontend is ../lib/contracts.json relative to contracts-project root?
  // Cwd is .../contracts-project.
  // Frontend lib is in ../lib
  const frontendAddressFile = path.resolve(process.cwd(), "../lib/contracts.json");
  let frontendAddresses: any = {};
  if (fs.existsSync(frontendAddressFile)) {
    frontendAddresses = JSON.parse(fs.readFileSync(frontendAddressFile, "utf8"));
  }
  frontendAddresses[networkName] = addresses;
  fs.writeFileSync(frontendAddressFile, JSON.stringify(frontendAddresses, null, 2));
  console.log(`Addresses saved to frontend: ${frontendAddressFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
