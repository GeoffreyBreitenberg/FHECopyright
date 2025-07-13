require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
      timeout: 120000,
    },
    hardhat: {
      chainId: 1337,
      forking: process.env.FORK_ENABLED === "true" && process.env.SEPOLIA_RPC_URL
        ? {
            url: process.env.SEPOLIA_RPC_URL,
            blockNumber: process.env.FORK_BLOCK_NUMBER ? parseInt(process.env.FORK_BLOCK_NUMBER) : undefined
          }
        : undefined,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: process.env.GAS_REPORT_FILE || undefined,
    noColors: process.env.GAS_REPORT_FILE ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || undefined,
    L1: "ethereum",
    L1Etherscan: process.env.ETHERSCAN_API_KEY || undefined,
  },
  mocha: {
    timeout: 120000,
    bail: false,
    allowUncaught: false,
    reporter: process.env.MOCHA_REPORTER || "spec",
  },
};
