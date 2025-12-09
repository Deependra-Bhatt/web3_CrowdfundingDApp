// project-module2\hardhat.config.mjs

import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

import { task } from "hardhat/config.js";

// basic task
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.17",
  defaultNetwork: "polygon",
  networks: {
    hardhat: {},
    polygon: {
      url: rpcUrl,
      accounts: privateKey ? [privateKey] : [],
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
