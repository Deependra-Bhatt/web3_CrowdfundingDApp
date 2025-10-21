// src/app/Campaigns.js

import { ethers, Contract } from "ethers";
import CampaignFactory from "../../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import HomePage from "./HomePage";

// ... (IPFS Config remains the same)

// --- IPFS Config ---
// This assumes NEXT_PUBLIC_PINATA_GATEWAY_URL is set in your .env.local
const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

// This function runs exclusively on the server
async function fetchCampaignData() {
  if (!process.env.NEXT_PUBLIC_RPC_URL || !process.env.NEXT_PUBLIC_ADDRESS) {
    console.error("FATAL: RPC URL or Contract Address missing in environment.");
    return { allData: [], healthData: [], educationData: [], animalData: [] };
  }

  try {
    // 1. Initialize the Provider using ONLY the URL.
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );

    // 2. CRITICAL STEP: Fetch the network explicitly. This makes the provider aware of the network,
    // often settling the configuration before the Contract object checks it.
    const network = await provider.getNetwork();
    console.log(
      `Connected to Network: ${network.name} (Chain ID: ${network.chainId})`
    );

    // 3. Contract Setup: Pass the provider
    const contract = new Contract(
      process.env.NEXT_PUBLIC_ADDRESS,
      CampaignFactory.abi,
      provider
    );

    //To get All Campaigns
    const getAllCampaigns = contract.filters.campaignCreated();
    const allCampaigns = await contract.queryFilter(
      getAllCampaigns,
      0,
      "latest"
    );
    const allData = allCampaigns.map((e) => {
      const requiredAmountEth = ethers.formatEther(e.args.requiredAmount);

      return {
        title: e.args.title,
        requiredAmount: Number(requiredAmountEth),
        image: e.args.campaignImage,
        owner: e.args.owner,
        timeStamp: Number(e.args.timestamp),
        category: e.args.category.toString(),
        campaignAddress: e.args.campaignAddress,
      };
    });

    // 3. Filter the complete set of data locally (JS array filter)
    const healthData = allData.filter((e) => e.category == "Health");
    const educationData = allData.filter((e) => e.category == "Education");
    const animalData = allData.filter((e) => e.category === "Animal");


    return { allData, healthData, educationData, animalData };
  } catch (error) {
    // If the error persists here, it means the RPC connection itself is fundamentally unstable.
    console.error("Failed to fetch campaigns from RPC. Final error:", error);
    return { allData: [], healthData: [], educationData: [], animalData: [] };
  }
}

/**
 * Main Server Component that fetches data and renders the client component.
 */
export default async function Campaigns() {
  const data = await fetchCampaignData();

  return (
    <HomePage
      allData={data.allData}
      healthData={data.healthData}
      educationData={data.educationData}
      animalData={data.animalData}
    />
  );
}
