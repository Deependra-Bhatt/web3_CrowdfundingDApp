// src\components\Dashboard\ManagementCard.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWeb3 } from "../Web3Context";
import { Contract } from "ethers";
import {
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatTimeRemaining } from "@/utils";

const ManagementCard = ({ campaign, refetchCampaigns, index }) => {
  const { signer, campaignAbi } = useWeb3();
  const [isTxLoading, setIsTxLoading] = useState(false);

  const required = Number(campaign.requiredAmount || 0);
  const received = Number(campaign.receivedAmount || 0);
  const isSuccessful = received >= required && required > 0;
  const isOver = (campaign.timeRemaining ?? 0) <= 0;

  const handleAction = async (actionType) => {
    if (!signer) return;
    setIsTxLoading(true);
    try {
      const cmp = new Contract(campaign.address, campaignAbi, signer);
      const tx = actionType.includes("Claim")
        ? await cmp.withdrawFunds()
        : await cmp.refund();
      toast.loading("Transaction processing...", { id: "mgmt" });
      await tx.wait();
      toast.success("Success!", { id: "mgmt" });
      if (refetchCampaigns) await refetchCampaigns();
    } catch (err) {
      toast.error(err?.reason || "Transaction failed", { id: "mgmt" });
    } finally {
      setIsTxLoading(false);
    }
  };

  return (
    <div
      className="group p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:border-lime-500/30 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 space-y-2">
          <Link
            href={`/campaign/${campaign.address}`}
            className="text-xl font-black text-gray-900 dark:text-white hover:text-lime-500 flex items-center gap-2"
          >
            {campaign.title}{" "}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </Link>
          <p className="text-xs font-mono text-gray-400 dark:text-white/30 truncate max-w-xs">
            {campaign.address}
          </p>
        </div>

        <div className="flex items-center gap-8 w-full md:w-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">
              Raised / Goal
            </span>
            <p className="font-bold text-gray-700 dark:text-white flex items-center gap-1 text-lg">
              <DollarSign className="w-4 h-4 text-lime-500" />
              {received.toFixed(3)} <span className="text-gray-300">/</span>{" "}
              {required.toFixed(2)}{" "}
              <span className="text-sm font-medium opacity-50">ETH</span>
            </p>
          </div>

          <div className="flex-1 md:flex-none">
            {campaign.isFinalized ? (
              <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-black border border-blue-500/20 uppercase">
                FINALIZED
              </div>
            ) : isOver ? (
              <button
                onClick={() => handleAction(isSuccessful ? "Claim" : "Refund")}
                disabled={isTxLoading}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                  isSuccessful
                    ? "bg-green-600 text-white shadow-green-500/20"
                    : "bg-rose-600 text-white shadow-rose-500/20"
                }`}
              >
                {isTxLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSuccessful ? (
                  "Claim Funds"
                ) : (
                  "Initiate Refund"
                )}
              </button>
            ) : (
              <div className="px-4 py-2 bg-lime-500/10 text-lime-600 dark:text-lime-400 rounded-xl text-xs font-black border border-lime-500/20 flex items-center gap-2">
                <Clock className="w-3 h-3" />{" "}
                {formatTimeRemaining(campaign.timeRemaining)} LEFT
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementCard;
