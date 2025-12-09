// src/components/Dashboard/UseUserCampaigns.js

"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../Web3Context";
import { Contract, ethers } from "ethers";
import toast from "react-hot-toast";

// CONFIGURATION
const startBlock = Number(
  process.env.NEXT_PUBLIC_FACTORY_DEPLOYMENT_BLOCK_NUMBER || 0
);

const useUserCampaigns = () => {
  const { address, provider, campaignAbi, factoryContract } = useWeb3();

  const [userCampaigns, setUserCampaigns] = useState([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

  const fetchUserCampaigns = useCallback(async () => {
    if (!provider || !address || !factoryContract) {
      setUserCampaigns([]);
      setIsCampaignsLoading(false);
      return;
    }

    setIsCampaignsLoading(true);
    let collectedLogs = [];

    try {
      // Build filter
      const filter = factoryContract.filters.campaignCreated(
        null,
        null,
        address, // owner (indexed)
        null,
        null,
        null,
        null
      );

      // Fetch all logs from the factory deployment block
      const allLogs = await factoryContract.queryFilter(
        filter,
        startBlock,
        "latest"
      );

      collectedLogs = allLogs;

      // Dedupe and map to initial campaign data
      const uniqueByAddr = new Map();
      for (const log of collectedLogs) {
        const addr = log.args && (log.args.campaignAddress || log.args[3]);
        if (addr) uniqueByAddr.set(addr.toLowerCase(), log);
      }

      const initialCampaigns = Array.from(uniqueByAddr.values()).map((log) => {
        // We extract the minimal data from the event args
        const requiredAmountRaw =
          (log.args && (log.args.requiredAmount || log.args[1])) || 0;
        const campaignAddress =
          (log.args && (log.args.campaignAddress || log.args[3])) || null;

        return {
          address: campaignAddress,
          requiredAmount: requiredAmountRaw
            ? Number(ethers.formatEther(requiredAmountRaw))
            : 0,
          receivedAmount: null,
          deadline: null,
          isFinalized: false,
          title: (log.args && (log.args.title || log.args[0])) || "Untitled",
          timeRemaining: null,
        };
      });

      // ENRICHMENT: Fetch full summary from each Campaign Contract
      const enriched = await Promise.all(
        initialCampaigns.map(async (c) => {
          if (!c.address || !campaignAbi) return c;

          try {
            const cmp = new Contract(c.address, campaignAbi, provider);

            // Call the single, efficient summary function
            const summary = await cmp.getCampaignSummary();

            const requiredVal = Number(ethers.formatEther(summary[1]));
            const receivedVal = Number(ethers.formatEther(summary[2]));
            const deadlineVal = Number(summary[4]);
            const isFinalized = Boolean(summary[11]);

            const tsNow = Math.floor(Date.now() / 1000);
            const timeRemaining = Math.max(0, deadlineVal - tsNow);

            return {
              ...c,
              title: summary[5] || c.title,
              requiredAmount: requiredVal,
              receivedAmount: receivedVal,
              deadline: deadlineVal,
              timeRemaining: timeRemaining,
              isFinalized: isFinalized,
            };
          } catch (err) {
            console.error("Enrichment failed for campaign", c.address, err);
            return c; // Return event-backed object on failure
          }
        })
      );

      setUserCampaigns(enriched);
    } catch (err) {
      console.error("Failed to fetch user campaigns:", err);
      toast.error(
        "Failed to fetch campaigns. RPC provider may have log limits."
      );
      setUserCampaigns([]);
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
