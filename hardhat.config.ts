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
  },
  etherscan: {
    apiKey: {
      // Is not required by blockscout. Can be any non-empty string
      'flow': "abc"
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
