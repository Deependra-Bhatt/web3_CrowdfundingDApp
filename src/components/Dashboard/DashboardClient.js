// src\components\Dashboard\DashboardClient.js
"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "../Web3Context";
import { Loader2, UserPlus, CircleCheck, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ManagementCard from "./ManagementCard";
import Link from "next/link";
import useUserCampaigns from "./UseUserCampaigns";

const DashboardClient = () => {
  const { address, signer, factoryContract, isLoading, connectWallet } =
    useWeb3();

  const [isCreator, setIsCreator] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingCreator, setIsCheckingCreator] = useState(true);

  const { userCampaigns, isCampaignsLoading, fetchUserCampaigns } =
    useUserCampaigns();

  useEffect(() => {
    const checkStatus = async () => {
      if (factoryContract && address) {
        try {
          const status = await factoryContract.isCreator(address);
          setIsCreator(status);
        } catch (err) {
          console.error("Error checking creator status:", err);
          setIsCreator(false);
        } finally {
          setIsCheckingCreator(false);
        }
      } else {
        setIsCheckingCreator(false);
      }
    };
    checkStatus();
  }, [factoryContract, address]);

  const handleRegisterCreator = async () => {
    if (!signer || !factoryContract) return;
    setIsRegistering(true);
    try {
      // Connect signer explicitly to factoryContract for transactions
      const tx = await factoryContract.connect(signer).registerAsCreator();
      toast.loading("Registration tx sent. Waiting for confirmation...");
      await tx.wait();
      setIsCreator(true);
      toast.success("Registered as Creator.");
    } catch (err) {
      console.error("Registration failed", err);
      toast.error(err?.reason || err?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading || isCheckingCreator) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin-slow mr-3" />
        {isLoading ? "Connecting to Web3..." : "Checking Creator status..."}
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl animate-fade-in-down">
        <p className="text-xl font-semibold text-red-500 mb-4">
          Wallet Disconnected
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect your wallet to view and manage your campaigns.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-[1.05] active:scale-95"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Creator box */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold mb-3 flex items-center text-gray-900 dark:text-gray-50">
          <UserPlus className="w-6 h-6 mr-3 text-lime-600 transition-transform duration-300 hover:rotate-6" />
          Creator Registration
        </h2>
        <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your Address:{" "}
            <span className="font-mono text-sm break-all"> {address}</span>
          </p>
          {isCreator ? (
            <div className="flex items-center text-xl font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50 p-3 rounded-lg animate-wiggle-once">
              <CircleCheck className="w-6 h-6 mr-3" />
              You are a registered LUMILIGHT Creator.
            </div>
          ) : (
            <>
              <div className="flex items-center text-xl font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg mb-4 animate-fade-in-fast">
                <AlertTriangle className="w-6 h-6 mr-3" />
                You are not yet a registered Creator.
              </div>
              <button
                onClick={handleRegisterCreator}
                disabled={isRegistering}
                className="flex items-center text-lg font-semibold text-white bg-lime-500 hover:bg-lime-600 disabled:bg-lime-700/50 rounded-full px-5 py-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md shadow-lime-500/30"
              >
                {isRegistering ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-5 h-5 mr-2" />
                )}
                {isRegistering ? "Registering..." : "Register as Creator"}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Registration requires a small one-time transaction fee (gas).
              </p>
            </>
          )}
        </div>
      </div>

      {/* Campaigns */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-gray-50">
          Your Launched Campaigns
        </h2>

        {isCampaignsLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
          </div>
        ) : userCampaigns.length === 0 ? (
          <div className="text-center p-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-fade-in">
            <p className="text-lg text-gray-500 dark:text-gray-300 mb-4">
              You haven't launched any campaigns yet.
            </p>
            <Link
              href="/create-campaign"
              className="text-lime-600 dark:text-lime-400 hover:underline font-medium hover:text-lime-500 transition"
            >
              Start your first campaign now!
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userCampaigns.map((campaign, index) => (
              <div
                key={campaign.address}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ManagementCard
                  campaign={campaign}
                  refetchCampaigns={fetchUserCampaigns}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;
