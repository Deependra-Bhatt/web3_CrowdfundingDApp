// src/app/api/data.js

import { ethers, Contract } from "ethers";
import CampaignFactory from "../../../artifacts/contracts/Campaign.sol/CampaignFactory.json";
import Campaign from "../../../artifacts/contracts/Campaign.sol/Campaign.json";

// Set to your project's Amoy RPC URL
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_ADDRESS;

if (!RPC_URL || !FACTORY_ADDRESS) {
  throw new Error(
    "Missing NEXT_PUBLIC_RPC_URL or NEXT_PUBLIC_ADDRESS environment variable."
  );
}

const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * Fetches campaign details and donations for a specific campaign address.
 * @param {string} campaignAddress - The address of the deployed campaign contract.
 */
export async function getCampaignData(campaignAddress) {
  // 1. Fetch Campaign State Data
  const campaignContract = new Contract(
    campaignAddress,
    Campaign.abi,
    provider
  );

  // NOTE: Using Promise.all for efficient concurrent reading
  const [title, requiredAmount, image, descriptionUrl, owner, receivedAmount] =
    await Promise.all([
      campaignContract.title(),
      campaignContract.requiredAmount(),
      campaignContract.image(),
      campaignContract.story(), // Assumes 'story' is the name of the description URL getter
      campaignContract.owner(),
      campaignContract.receivedAmount(),
    ]);

  const Data = {
    address: campaignAddress,
    title: title.toString(),
    requiredAmount: ethers.formatEther(requiredAmount),
    image: image.toString(),
    receivedAmount: ethers.formatEther(receivedAmount),
    descriptionUrl: descriptionUrl.toString(),
    owner: owner.toString(),
  };

  // 2. Fetch All Donations Events for this campaign
  const donationsFilter = campaignContract.filters.donated();
  const allDonations = await campaignContract.queryFilter(donationsFilter);

  // CRITICAL: Convert all BigInt/Ethers types to primitives
  const DonationsData = allDonations.map((e) => {
    return {
      donor: e.args.donar.toString(),
      amount: ethers.formatEther(e.args.amount),
      timestamp: Number(e.args.timestamp),
    };
  });

  return { Data, DonationsData };
}

/**
 * Fetches the list of all deployed campaigns (for potential sitemap/static generation).
 */
export async function getAllDeployedCampaigns() {
  const factoryContract = new Contract(
    FACTORY_ADDRESS,
    CampaignFactory.abi,
    provider
  );
  const getAllCampaignsFilter = factoryContract.filters.campaignCreated();

  // Querying all events is a heavy operation, often better done via a service like TheGraph
  const allCampaignEvents = await factoryContract.queryFilter(
    getAllCampaignsFilter
  );

  // Return only the address to avoid passing unnecessary large data structure
  return allCampaignEvents.map((e) => e.args.campaignAddress.toString());
}
