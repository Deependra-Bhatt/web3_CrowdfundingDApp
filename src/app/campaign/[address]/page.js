// src\app\campaign\[address]\page.js
"use-client";

export const dynamic = "force-dynamic";
import { JsonRpcProvider, Contract, ethers } from "ethers";
import Campaign from "../../../../artifacts/contracts/Campaign.sol/Campaign.json";
import DetailClient from "./DetailClient";
import { notFound } from "next/navigation";

// CONFIGURATION
const CAMPAIGN_ABI = Campaign.abi;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology/";
// END CONFIGURATION

// Function to fetch all campaign data
async function getCampaignData(campaignAddress) {
  if (!campaignAddress || !ethers.isAddress(campaignAddress)) {
    return null;
  }

  try {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    const campaignContract = new Contract(
      campaignAddress,
      CAMPAIGN_ABI,
      rpcProvider
    );

    // Call the getCampaignSummary function
    const summary = await campaignContract.getCampaignSummary();

    const deadlineTimestamp = Number(summary[4]);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return {
      address: campaignAddress,
      owner: summary[0],
      requiredAmount: ethers.formatEther(summary[1]),
      receivedAmount: ethers.formatEther(summary[2]),
      deadline: deadlineTimestamp,
      title: summary[5],
      description: summary[7],
      imageURI: summary[6],
      platformFeeAddress: summary[9],
      deadlineExtended: summary[10],
      withdrawn: summary[11],

      timeRemaining:
        deadlineTimestamp > currentTimestamp
          ? deadlineTimestamp - currentTimestamp
          : 0,
    };
  } catch (error) {
    console.error(
      `Error fetching campaign data for ${campaignAddress}:`,
      error
    );
    return null;
  }
}

export default async function CampaignDetailsPage({ params }) {
  const awaitedParams = await params;
  const campaignAddress = awaitedParams.address;
  const campaignData = await getCampaignData(campaignAddress);

  if (!campaignData) {
    // Next.js notFound() helper for 404
    notFound();
  }

  return <DetailClient initialData={campaignData} />;
}

// Dynamic Metadata for the page
export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const campaignAddress = awaitedParams.address;
  const campaignData = await getCampaignData(campaignAddress);
  if (!campaignData) {
    return { title: "Campaign Not Found" };
  }
  return {
    title: campaignData.title,
    description: campaignData.description.substring(0, 150) + "...",
  };
}
