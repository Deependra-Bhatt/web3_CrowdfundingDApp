// src/app/page.js

import { JsonRpcProvider, Contract, ethers } from "ethers";
import CampaignFactory from "../../artifacts/contracts/CampaignFactory.sol/CampaignFactory.json";
import Campaign from "../../artifacts/contracts/Campaign.sol/Campaign.json";
import HomeClient from "../components/Home/HomeClient";
import Link from "next/link";

// CONFIGURATION
const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_ADDRESS || "FallbackFactoryAddress";
const CAMPAIGN_ABI = Campaign.abi;
const START_BLOCK = Number(
  process.env.NEXT_PUBLIC_FACTORY_DEPLOYMENT_BLOCK_NUMBER || 0
);
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology/";
// END CONFIGURATION

/**
 * Server-Side function to fetch, process, and sort all campaign data.
 * @returns {Array<Object>} List of sorted campaign objects.
 */
async function getAllCampaigns() {
  try {
    // 1. Initializing Read-Only RPC Provider
    const rpcProvider = new JsonRpcProvider(RPC_URL); // 2. Initializing Factory Contract Interface and Contract Instance

    const factoryContract = new Contract(
      FACTORY_ADDRESS,
      CampaignFactory.abi,
      rpcProvider
    ); // 3. Creating filter for all CampaignCreated events

    const filter = factoryContract.filters.campaignCreated(); // 4. Querying the blockchain for past campaignCreated events using queryFilter

    console.log(`Querying all historical logs from block ${START_BLOCK}...`);

    const allCampaignList = await factoryContract.queryFilter(
      filter,
      START_BLOCK,
      "latest"
    ); // 5. Map logs to campaign addresses and fetch dynamic data

    const campaignsWithNulls = await Promise.all(
      allCampaignList.map(async (log) => {
        // We rely on event args to get the campaign address
        const campaignAddress = log.args.campaignAddress || log.args[1];

        if (!campaignAddress) {
          console.warn("Log missing campaignAddress:", log);
          return null;
        } // Initializing individual campaign

        const campaignContract = new Contract(
          campaignAddress,
          CAMPAIGN_ABI,
          rpcProvider
        ); // Calling the getCampaignSummary function to retrive data for a individual campaign

        const summary = await campaignContract.getCampaignSummary();

        const deadlineTimestamp = Number(summary[4]);
        const requiredAmount = Number(ethers.formatEther(summary[1]));
        const receivedAmount = Number(ethers.formatEther(summary[2]));
        const currentTime = Math.floor(Date.now() / 1000);
        const isOver = deadlineTimestamp <= currentTime;
        const isSuccessful = receivedAmount >= requiredAmount;

        return {
          address: campaignAddress,
          owner: summary[0],
          requiredAmount: requiredAmount,
          receivedAmount: receivedAmount,
          deadline: deadlineTimestamp,
          title: summary[5],
          description: summary[7],
          imageURI: summary[6],
          platformFeeAddress: summary[9],
          deadlineExtended: summary[10],
          isWithdrawn: summary[11], // Calculated for sorting and initial display
          isOver: isOver,
          isSuccessful: isSuccessful,
          timeRemaining: isOver ? 0 : deadlineTimestamp - currentTime,
        };
      })
    ); // Filters out any failed mappings

    let campaigns = campaignsWithNulls.filter((c) => c !== null); // 6. Implement Sorting Logic // Priority: Active (timeRemaining > 0) > Successful (isOver && isSuccessful) > Failed (isOver && !isSuccessful)

    campaigns.sort((a, b) => {
      // Helper function to get a numerical sort value for campaign state
      const getSortValue = (campaign) => {
        if (campaign.timeRemaining > 0) return 1; // Active: Highest priority
        if (campaign.isOver && campaign.isSuccessful) return 2; // Successful: Second priority
        return 3; // Failed: Lowest priority
      };

      const sortA = getSortValue(a);
      const sortB = getSortValue(b); // Sort primary groups: Active (1) before Successful (2) before Failed (3)

      if (sortA !== sortB) {
        return sortA - sortB;
      } // Secondary sort within groups:

      if (sortA === 1) {
        // Active campaigns: Sort by closest deadline first (ascending time remaining)
        return a.timeRemaining - b.timeRemaining;
      } else if (sortA === 2) {
        // Successful campaigns: Sort by highest received amount first (descending)
        return b.receivedAmount - a.receivedAmount;
      } else if (sortA === 3) {
        // Failed campaigns: Sort by lowest received amount first (ascending)
        return a.receivedAmount - b.receivedAmount;
      }
      return 0;
    });

    return campaigns;
  } catch (e) {
    console.error("Error fetching campaigns:", e);
    return [];
  }
}

export default async function Homepage() {
  const campaigns = await getAllCampaigns();
  return (
    <div className="pt-8">
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-100 dark:bg-gray-800 rounded-xl mt-10 shadow-inner animate-fade-in-up">
          <p className="text-2xl font-semibold text-lime-600 dark:text-lime-400 mb-4">
            No Campaigns Yet!
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Be the first to launch your vision and light up the path for others.
          </p>
          <Link
            href="/create-campaign"
            className="mt-6 px-6 py-3 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition shadow-lg shadow-lime-500/50 hover:scale-105"
          >
            Start a Campaign
          </Link>
        </div>
      ) : (
        <HomeClient initialCampaigns={campaigns} />
      )}
    </div>
  );
}
