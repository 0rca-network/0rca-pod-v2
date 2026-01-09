import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    cronosTestnet: {
      type: "http",
      url: "https://evm-t3.cronos.org",
      chainId: 338,
      accounts: {
        mnemonic: "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle",
      },
      gasPrice: 1600000000000,
    },
    ganache: {
      type: "http",
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: {
        mnemonic: "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle",
      },
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:7545",
    }
  },
};

export default config;
