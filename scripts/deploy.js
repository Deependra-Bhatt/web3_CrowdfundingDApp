//crowdfunding-app-prototype\scripts\deploy.js

const hre = require("hardhat");

async function main() {
  const CampaignFactory = await hre.ethers.getContractFactory(
    "CampaignFactory"
  );
  const campaignFactory = await CampaignFactory.deploy();

  await campaignFactory.waitForDeployment();
  const deployedAddress = await campaignFactory.getAddress();
  console.log("Factory deployed to:", deployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
