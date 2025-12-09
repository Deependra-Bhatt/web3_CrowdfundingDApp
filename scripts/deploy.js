// project-module2\scripts\deploy.js

import hre from "hardhat";

async function main() {
  console.log("Starting deployment of CampaignFactory...");

  // Getting the Campaign Factory i.e finding the compiled contract artifact in /artifacts
  const CampaignFactory = await hre.ethers.getContractFactory(
    "CampaignFactory"
  );

  // Deploying the Contract
  const campaignFactory = await CampaignFactory.deploy();

  // Wait for the transaction to be mined
  await campaignFactory.waitForDeployment();

  // Get Deployment Transaction Receipt
  const deploymentTransaction = campaignFactory.deploymentTransaction();
  const receipt = await deploymentTransaction.wait();

  // Getting the deployed address
  const deployedAddress = await campaignFactory.getAddress();

  // Extract Block Number
  const deploymentBlockNumber = receipt.blockNumber;

  console.log("CampaignFactory successfully deployed!");
  console.log("Factory deployed to:", deployedAddress);
  console.log("Deployment Block Number:", deploymentBlockNumber);
}
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
