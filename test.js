const { ethers, Contract } = require("ethers");
// Use a direct import for dotenv configuration if you are running this via Node
// If running via hardhat, the 'require("dotenv").config()' is often sufficient
require("dotenv").config({ path: "./.env.local" });

// Note: Ensure the path to your ABI JSON is correct for a Node environment
const CampaignFactory = require("./artifacts/contracts/Campaign.sol/CampaignFactory.json");

const main = async () => {
  // 1. Provider Initialization (v6 syntax)
  // JsonRpcProvider is now directly available on the ethers object.
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL // Ensure this variable is set in .env.local
  );

  // 2. Contract Initialization (v6 syntax)
  // Use the imported Contract class (or ethers.Contract)
  const contract = new Contract(
    process.env.NEXT_PUBLIC_ADDRESS, // Ensure this variable is set in .env.local
    CampaignFactory.abi,
    provider // Provider is now passed as the third argument for read-only access
  );

  // 3. Filtering and Querying Events (v6 syntax)
  // Contract.filters is still the correct way to generate the filter object.
  const getDeployedCampaign = contract.filters.campaignCreated();

  // queryFilter now requires the filter, start block, and end block.
  // We pass the filter and use 'latest' for the end block.
  // NOTE: If you need events from the start of time, specify the deployment block here.
  let events = await contract.queryFilter(getDeployedCampaign, 0, "latest");

  // Reverse the events so the newest appears first
  let event = events.reverse();

  console.log("--- Deployed Campaign Events ---");
  console.log(event);
  console.log("INDIVIDUAL");
  if (event.length > 0) {
    // Logging the results
    event.forEach((e, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Title: ${e.args.title}`);
      console.log(`  Address: ${e.args.campaignAddress}`);
      console.log(
        `  Required Amount: ${ethers.formatEther(e.args.requiredAmount)} MATIC`
      );
      console.log(`  Category: ${e.args.category}`);
    });
  } else {
    console.log("No campaign creation events found.");
  }
};

main().catch((error) => {
  console.error("An error occurred during execution:", error);
  process.exit(1);
});
