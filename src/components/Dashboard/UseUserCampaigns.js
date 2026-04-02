// src/components/Dashboard/UseUserCampaigns.js

"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../Web3Context";
import { Contract, ethers } from "ethers";
import toast from "react-hot-toast";

const useUserCampaigns = () => {
  const { address, provider, campaignAbi, factoryContract } = useWeb3();
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

  const fetchUserCampaigns = useCallback(async () => {
    // Basic safety check
    if (!provider || !address || !factoryContract || !campaignAbi) return;

    setIsCampaignsLoading(true);
    try {
      // 1. Get ALL campaign addresses directly from the factory (No Events involved!)
      const allAddresses = await factoryContract.getDeployedCampaigns();

      const userOwnedCampaigns = [];

      // 2. ENRICH & FILTER (One by one to respect rate limits)
      // We process them backwards (latest first)
      const reversedAddresses = [...allAddresses].reverse();

      for (const campAddr of reversedAddresses) {
        try {
          const cmp = new Contract(campAddr, campaignAbi, provider);

          // Fetch the summary to see who owns it and get data
          const summary = await cmp.getCampaignSummary();

          const campaignOwner = summary[0]; // Assuming index 0 is owner in your getCampaignSummary

          // 3. Filter: Only keep if it belongs to the current user
          if (campaignOwner.toLowerCase() === address.toLowerCase()) {
            userOwnedCampaigns.push({
              address: campAddr,
              requiredAmount: Number(ethers.formatEther(summary[1])),
              receivedAmount: Number(ethers.formatEther(summary[2])),
              deadline: Number(summary[4]),
              timeRemaining: Math.max(
                0,
                Number(summary[4]) - Math.floor(Date.now() / 1000),
              ),
              isFinalized: Boolean(summary[11]),
              title: summary[5],
              image: summary[6],
            });
          }

          // Small delay to prevent 429 Rate Limit from Infura
          await new Promise((r) => setTimeout(r, 100));

          // Optimization: If you only want to show the last 5 campaigns,
          // you could break here once userOwnedCampaigns.length === 5
        } catch (enrichErr) {
          console.error(`Failed to fetch summary for ${campAddr}`, enrichErr);
        }
      }

      setUserCampaigns(userOwnedCampaigns);
    } catch (err) {
      console.error("Master Error:", err);
      toast.error("Could not load your campaigns.");
    } finally {
      setIsCampaignsLoading(false);
    }
  }, [address, provider, campaignAbi, factoryContract]);

  useEffect(() => {
    fetchUserCampaigns();
  }, [fetchUserCampaigns]);

  return { userCampaigns, isCampaignsLoading, fetchUserCampaigns };
};

export default useUserCampaigns;
