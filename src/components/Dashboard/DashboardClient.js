// src\components\Dashboard\DashboardClient.js
"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "../Web3Context";
import {
  Loader2,
  UserPlus,
  CircleCheck,
  AlertTriangle,
  Wallet,
  Activity,
} from "lucide-react";
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
      const tx = await factoryContract.connect(signer).registerAsCreator();
      toast.loading("Registration initiated...", { id: "reg" });
      await tx.wait();
      setIsCreator(true);
      toast.success("Welcome to the Creator Guild!", { id: "reg" });
    } catch (err) {
      toast.error(err?.reason || "Registration failed", { id: "reg" });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading || isCheckingCreator)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
          Loading Profile
        </p>
      </div>
    );

  if (!address)
    return (
      <div className="p-12 text-center bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem] animate-fade-in-up">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-6">Connect to View Dashboard</h2>
        <button
          onClick={connectWallet}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* --- CREATOR STATUS CARD --- */}
      <div className="relative overflow-hidden p-8 bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/30">
              Network Identity
            </h2>
            <p className="font-mono text-lg font-bold text-gray-800 dark:text-lime-400 break-all bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5">
              {address}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isCreator ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 px-6 py-3 bg-lime-500 text-black rounded-2xl font-black shadow-lg shadow-lime-500/20">
                  <CircleCheck className="w-5 h-5" /> VERIFIED CREATOR
                </div>
              </div>
            ) : (
              <button
                onClick={handleRegisterCreator}
                disabled={isRegistering}
                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:bg-gray-400"
              >
                {isRegistering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                Register as Creator
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CAMPAIGN LIST SECTION --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Activity className="w-6 h-6 text-lime-500" /> Your Campaigns
          </h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {userCampaigns.length} Total
          </span>
        </div>

        {isCampaignsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : userCampaigns.length === 0 ? (
          <div className="p-16 text-center bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 border-dashed">
            <p className="text-gray-500 dark:text-white/40 font-bold mb-4 italic">
              No campaigns found for this wallet.
            </p>
            <Link
              href="/create-campaign"
              className="inline-block px-8 py-3 bg-lime-500 text-black font-black rounded-2xl hover:scale-105 transition-all"
            >
              Start your first mission
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {userCampaigns.map((campaign, index) => (
              <ManagementCard
                key={campaign.address}
                campaign={campaign}
                refetchCampaigns={fetchUserCampaigns}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;
