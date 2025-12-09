// src\app\campaign\[address]\DetailClient.js
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../../../components/Web3Context";
import { ethers, Contract } from "ethers";
import {
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  User,
  Loader2,
  Edit3,
  Repeat,
} from "lucide-react";
import { convertIPFSURIToHTTP, formatTimeRemaining } from "@/utils";
import { useNotification } from "../../../components/NotificationContext";
import toast from "react-hot-toast";

// CONFIGURATION
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology/";
const PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";
// END CONFIGURATION

// Main Client Component
const DetailClient = ({ initialData }) => {
  const { address, signer, provider, campaignAbi, connectWallet } = useWeb3();
  const [campaign, setCampaign] = useState(initialData);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [newDeadlineInput, setNewDeadlineInput] = useState("");
  const [contributedAmount, setContributedAmount] = useState(0);
  const [storyContent, setStoryContent] = useState("Loading campaign story...");
  const { showNotification } = useNotification();

  const isOwner =
    address && address.toLowerCase() === campaign.owner.toLowerCase();
  const isOver = campaign.timeRemaining <= 0;
  const isSuccessful =
    parseFloat(campaign.receivedAmount) >= parseFloat(campaign.requiredAmount);
  const progress =
    (parseFloat(campaign.receivedAmount) /
      parseFloat(campaign.requiredAmount)) *
    100;

  const campaignAddress = campaign.address;

  const fetchStoryContent = useCallback(async (storyURI) => {
    if (!storyURI) return setStoryContent("No campaign story available.");

    const httpUrl = convertIPFSURIToHTTP(storyURI, PINATA_GATEWAY_URL);

    try {
      const response = await fetch(httpUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setStoryContent(text);
    } catch (error) {
      console.error(
        "Failed to fetch campaign story from IPFS:",
        httpUrl,
        error
      );
      setStoryContent(
        "Failed to load campaign story. Check IPFS gateway and CORS settings."
      );
    }
  }, []);

  // Fetching: Contributor Amount & Refresh
  const fetchContributorAmount = useCallback(async () => {
    if (!provider || !address) {
      setContributedAmount(0);
      return;
    }

    try {
      const campaignContract = new Contract(
        campaignAddress,
        campaignAbi,
        provider
      );
      const amountWei = await campaignContract.contributors(address);
      setContributedAmount(ethers.formatEther(amountWei));
    } catch (error) {
      console.error("Error fetching contributed amount:", error);
    }
  }, [address, provider, campaignAddress, campaignAbi]);

  const refreshCampaignData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const rpcProvider = new JsonRpcProvider(RPC_URL);
      const campaignContract = new Contract(
        campaignAddress,
        campaignAbi,
        rpcProvider
      );

      // Re-fetch summary
      const summary = await campaignContract.getCampaignSummary();

      const deadlineTimestamp = Number(summary[4]);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      setCampaign({
        ...campaign,
        owner: summary[0],
        requiredAmount: ethers.formatEther(summary[1]),
        receivedAmount: ethers.formatEther(summary[2]),
        deadline: deadlineTimestamp || summary[4],
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
      });
      await fetchContributorAmount();
    } catch (error) {
      console.error("Error refreshing campaign data:", error);
      showNotification("Failed to refresh campaign data.");
    } finally {
      setIsDataLoading(false);
    }
  }, [campaignAddress, campaignAbi, fetchContributorAmount]);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchContributorAmount();
    fetchStoryContent(initialData.description);
    // Set up interval for refreshing data and time remaining every minute
    const interval = setInterval(() => {
      setCampaign((prevCampaign) => ({
        ...prevCampaign,
        timeRemaining: Math.max(
          0,
          prevCampaign.deadline - Math.floor(Date.now() / 1000)
        ),
      }));
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [fetchContributorAmount, initialData.description, fetchStoryContent]);

  // Transaction Handlers
  const executeTransaction = async (
    contractFunction,
    value = 0,
    alertMessage
  ) => {
    if (!signer) {
      showNotification("Please connect your wallet to execute this action.");
      return;
    }

    setIsTxLoading(true);
    try {
      const campaignContractWithSigner = new Contract(
        campaignAddress,
        campaignAbi,
        signer
      );

      const tx = await contractFunction(campaignContractWithSigner);

      showNotification(
        `${alertMessage} transaction sent! Waiting for confirmation... Hash: ${tx.hash}`
      );
      await tx.wait();
      toast.success(`${alertMessage} successful!`);

      // Refresh data after successful transaction
      await refreshCampaignData();
    } catch (error) {
      console.error(`${alertMessage} failed:`, error);
      const userMessage =
        error.reason || "Transaction failed. Check console for details.";
      showNotification(`${alertMessage} failed: ${userMessage}`);
    } finally {
      setIsTxLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donationAmount || parseFloat(donationAmount) <= 0)
      return showNotification("Enter a valid amount.");
    if (!address) return connectWallet();
    if (isOver)
      return showNotification(
        "Donations are closed as the deadline has passed."
      );

    const amountWei = ethers.parseEther(donationAmount);

    await executeTransaction(
      (contract) => contract.donate({ value: amountWei }),
      amountWei,
      "Donation"
    );
    setDonationAmount("");
  };

  const handleWithdraw = () => {
    if (!isOwner) return;

    executeTransaction((contract) => contract.withdrawFunds(), 0, "Withdrawal");
  };

  const handleRefund = () => {
    if (contributedAmount <= 0) return;

    executeTransaction((contract) => contract.refund(), 0, "Refund");
  };

  const handleExtendDeadline = async (e) => {
    e.preventDefault();
    if (!newDeadlineInput)
      return showNotification("Please select a new deadline.");
    if (!isOwner) return;

    try {
      // 1. Calculate the user's proposed new deadline (in Unix seconds)
      const deadlineUnix = Math.floor(
        new Date(newDeadlineInput).getTime() / 1000
      );

      const currentDeadline = campaign.deadline;

      // CLIENT-SIDE VALIDATION

      // 2. Check if the new deadline is in the future
      if (deadlineUnix <= Math.floor(Date.now() / 1000)) {
        return showNotification("The new deadline must be set in the future.");
      }

      // 3. Calculate the absolute maximum allowed deadline (current deadline + 7 days)
      // 7 days = 7 * 24 * 3600 seconds = 604,800 seconds
      const MAX_EXTENSION_SECONDS = 604800;
      const maxAllowedDeadline = currentDeadline + MAX_EXTENSION_SECONDS;

      // 4. Check if the user's input exceeds the contract's limit
      if (deadlineUnix > maxAllowedDeadline) {
        const maxDate = new Date(maxAllowedDeadline * 1000).toLocaleString();
        return showNotification(
          `The extension cannot exceed 7 days past the current deadline. Maximum allowed deadline: ${maxDate}`
        );
      }
      // END CLIENT-SIDE VALIDATION

      // If validation passes, proceed with the transaction
      await executeTransaction(
        (contract) => contract.extendDeadline(deadlineUnix),
        0,
        "Deadline Extension"
      );
      setNewDeadlineInput("");
    } catch (error) {
      console.error("Error extending deadline:", error);
      showNotification("Failed to convert date or deadline is invalid.");
    }
  };

  // Conditional Management UI Logic
  const getOwnerActions = () => {
    if (!isOwner) return null;

    const canWithdraw = isSuccessful && isOver && !campaign.withdrawn;
    const canExtend = !isOver && !campaign.deadlineExtended;

    return (
      <div className="bg-lime-50 dark:bg-lime-900/20 p-6 rounded-xl border border-lime-200 dark:border-lime-800 space-y-4 animate-fade-in">
        <h3 className="text-xl font-bold text-lime-700 dark:text-lime-400 flex items-center">
          <User className="w-5 h-5 mr-2" /> Creator Actions
        </h3>

        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={isTxLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:bg-gray-500"
          >
            {isTxLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <DollarSign className="w-5 h-5 mr-2" />
            )}
            {isTxLoading ? "Confirming Withdrawal..." : "Withdraw Funds"}
          </button>
        )}

        {canExtend && (
          <form onSubmit={handleExtendDeadline} className="space-y-2 animate-fade-in-down">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Repeat className="w-4 h-4 mr-2 transition-transform duration-300 hover:rotate-180" /> Extend Deadline
            </h4>
            <input
              type="datetime-local"
              value={newDeadlineInput}
              onChange={(e) => setNewDeadlineInput(e.target.value)}
              required
              min={new Date(Date.now()).toISOString().slice(0, 16)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition"
            />
            <button
              type="submit"
              disabled={isTxLoading || !newDeadlineInput}
              className="w-full flex items-center justify-center px-4 py-2 text-sm bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:bg-gray-500"
            >
              {isTxLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Edit3 className="w-4 h-4 mr-2" />
              )}
              Extend Deadline
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              Can only be done once before the current deadline.
            </p>
          </form>
        )}

        {!canWithdraw && !canExtend && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isOver
              ? "Campaign finalized or failed (no further owner actions)."
              : "Waiting for deadline to pass to withdraw."}
          </p>
        )}
      </div>
    );
  };

  const getContributorActions = () => {
    const canRefund =
      !isSuccessful && isOver && parseFloat(contributedAmount) > 0;

    if (canRefund) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 space-y-4 animate-fade-in-down">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
            Refund Available
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The campaign failed to reach its goal. You contributed
            {contributedAmount} ETH. You can now initiate your refund.
          </p>
          <button
            onClick={handleRefund}
            disabled={isTxLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:bg-gray-500"
          >
            {isTxLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <DollarSign className="w-5 h-5 mr-2" />
            )}
            {isTxLoading ? "Confirming Refund..." : "Claim Refund"}
          </button>
        </div>
      );
    }
    return null;
  };

  // Status and Time UI
  const StatusBadge = () => {
    let text, color;
    if (!isOver) {
      text = "Active";
      color = "bg-lime-500 text-white";
    } else if (isSuccessful && campaign.withdrawn) {
      text = "Finalized";
      color = "bg-blue-600 text-white";
    } else if (isSuccessful && !campaign.withdrawn) {
      text = "Successful (Awaiting Withdrawal)";
      color = "bg-green-600 text-white";
    } else if (!isSuccessful) {
      text = "Failed (Refunds Available)";
      color = "bg-red-600 text-white";
    } else {
      text = "Unknown Status";
      color = "bg-gray-500 text-white";
    }

    return (
      <span
        className={`absolute top-4 right-4 text-sm font-semibold px-4 py-2 rounded-full flex items-center shadow-lg ${color}`}
      >
        {isSuccessful ? (
          <CheckCircle className="w-5 h-5 mr-2" />
        ) : (
          <XCircle className="w-5 h-5 mr-2" />
        )}
        {text}
      </span>
    );
  };

  // Main Layout
  return (
    <div className="pt-8 max-w-7xl mx-auto space-y-12 animate-fade-in-up">
      <header className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border-t-4 border-lime-500 dark:border-lime-400 transition-shadow duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image & Progress */}
          <div className="lg:col-span-1">
            <img
              src={
                convertIPFSURIToHTTP(campaign.imageURI, PINATA_GATEWAY_URL) ||
                "https://placehold.co/600x400/3c3d3f/ffffff?text=LUMILIGHT+Campaign"
              }
              alt={campaign.title}
              className="w-full h-auto rounded-lg object-cover transition-transform duration-300 hover:scale-[1.01] shadow-lg"
            />
            <div className="mt-6">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Progress: {progress.toFixed(2)}%
              </p>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isSuccessful ? "bg-blue-500" : "bg-lime-500"
                  }`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Middle: Title, Description, Metrics */}
          <div className="lg:col-span-2">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">
              {campaign.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {storyContent}
            </p>

            <div className="grid grid-cols-3 gap-6 text-center border-y py-4 border-gray-200 dark:border-gray-700 mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition duration-300 hover:scale-[1.03]">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Goal (ETH)
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {campaign.requiredAmount}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition duration-300 hover:scale-[1.03]">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Raised (ETH)
                </p>
                <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                  {campaign.receivedAmount}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition duration-300 hover:scale-[1.03]">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time Left
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatTimeRemaining(campaign.timeRemaining)}
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 break-all">
              Owner: <span className="font-mono">{campaign.owner}</span>
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 break-all mt-1">
              Contract: <span className="font-mono">{campaign.address}</span>
            </p>
          </div>
        </div>
        <StatusBadge />
      </header>

      {/* Actions Section: Donate / Creator Actions / Refund */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Donation Form */}
        <div className="lg:col-span-2">
          {!isOver ? (
            <form
              onSubmit={handleDonate}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in-down"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-lime-500 transition-transform duration-300 hover:scale-110" />
                Support this Project
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter the amount of ETH you wish to contribute. If the campaign
                fails, you can claim a refund.
              </p>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="0.5 ETH"
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
              />
              <button
                type="submit"
                disabled={
                  isTxLoading ||
                  !donationAmount ||
                  parseFloat(donationAmount) <= 0
                }
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-lime-600 hover:bg-lime-700 disabled:bg-gray-500 transition-all duration-300 hover:scale-[1.01] active:scale-95 shadow-md"
              >
                {isTxLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {isTxLoading ? "Processing Donation" : "Donate Now"}
              </button>
              {parseFloat(contributedAmount) > 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 animate-fade-in">
                  You have contributed {contributedAmount} ETH so far.
                </p>
              )}
            </form>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 animate-fade-in-down">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-red-500 animate-pulse" />
                Donations Closed
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                The deadline for this campaign has passed. Check the status and
                actions panel for finalization or refund options.
              </p>
            </div>
          )}
        </div>

        {/* 2. Management Panel (Owner/Contributor Actions) */}
        <div className="lg:col-span-1 space-y-6">
          {getOwnerActions()}
          {getContributorActions()}
          {isDataLoading && (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-lime-500" />{" "}
              Refreshing Data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailClient;
