import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  ignition: {
    requiredConfirmations: 1,
  },
  networks: {
    flow: {
      url: 'https://mainnet.evm.nodes.onflow.org',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
      gas: 5000000,
      // gasPrice: 100000000,
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
    base: {
      url: 'https://mainnet.base.org/',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
    mainnet: {
      url: 'https://eth.public-rpc.com',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
    optimism: {
      url: 'https://mainnet.optimism.io',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
    arbitrum: {
      url: 'https://arb1.arbitrum.io/rpc',
      accounts: [process.env.DEPLOY_WALLET_1 as string],
    },
  },
  etherscan: {
    apiKey: {
      // Is not required by blockscout. Can be any non-empty string
      'flow': "abc",
      polygon: "abc",
      base: process.env.BASESCAN_API_KEY as string,
    },
    customChains: [
      {
        network: "flow",
        chainId: 747,
        urls: {
          apiURL: "https://evm.flowscan.io/api",
          browserURL: "https://evm.flowscan.io/",
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }
};

export default config;
