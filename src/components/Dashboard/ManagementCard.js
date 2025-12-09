// src\components\Dashboard\ManagementCard.js
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWeb3 } from "../Web3Context";
import { Contract } from "ethers";
import { Loader2, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { formatTimeRemaining } from "@/utils";

// ManagementCard
const ManagementCard = ({ campaign, refetchCampaigns }) => {
  const { signer, campaignAbi } = useWeb3();
  const [isTxLoading, setIsTxLoading] = useState(false);

  const required = Number(campaign.requiredAmount || 0);
  const received = Number(campaign.receivedAmount || 0);
  const isSuccessful = received >= required && required > 0;
  const isOver = (campaign.timeRemaining ?? 0) <= 0;

  let requiredAction = null;
  if (isOver && !campaign.isFinalized) {
    requiredAction = isSuccessful ? "Finalize & Claim" : "Initiate Refund";
  }

  const handleAction = async (actionType) => {
    if (!signer || !campaignAbi) {
      toast.error("Missing signer or campaign ABI.");
      return;
    }
    setIsTxLoading(true);
    try {
      const cmp = new Contract(campaign.address, campaignAbi, signer);
      let tx;
      if (actionType === "Finalize & Claim") {
        tx = await cmp.withdrawFunds();
      } else {
        tx = await cmp.refund();
      }

      toast.promise(tx.wait(), {
        loading: `${actionType} in progress...`,
        success: `${actionType} succeeded.`,
        error: `${actionType} failed.`,
      });

      await tx.wait();
      if (refetchCampaigns) await refetchCampaigns();
    } catch (err) {
      console.error(actionType, "failed", err);
      const msg =
        err?.reason ||
        err?.message ||
        "Transaction failed. Check console for details.";
      toast.error(msg);
    } finally {
      setIsTxLoading(false);
    }
  };

  const getStatusUI = () => {
    if (campaign.isFinalized) {
      return (
        <div className="flex items-center text-lg font-semibold text-blue-600 dark:text-blue-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          {isSuccessful ? "Funds Claimed" : "Refunds Initiated"}
        </div>
      );
    } else if (!isOver) {
      return (
        <div className="flex items-center text-lg font-semibold text-lime-600 dark:text-lime-400">
          <Clock className="w-5 h-5 mr-2" />
          Active: {formatTimeRemaining(campaign.timeRemaining ?? 0)} remaining
        </div>
      );
    } else if (isOver && !isSuccessful) {
      return (
        <div className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400">
          <XCircle className="w-5 h-5 mr-2" />
          Failed: Awaiting Refund
        </div>
      );
    } else if (isOver && isSuccessful) {
      return (
        <div className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          Successful: Ready to Finalize
        </div>
      );
    }
  };

  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.005]">
      <Link
        href={`/campaign/${campaign.address}`}
        className="text-xl font-bold text-gray-900 dark:text-gray-50 hover:text-lime-500 transition duration-200 line-clamp-1"
      >
        {campaign.title}
      </Link>

      <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1 mb-4 truncate">
        {campaign.address}
      </p>

      <div className="flex justify-between items-center border-t border-b py-3 mb-4 border-gray-200 dark:border-gray-600">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 text-lime-500 mr-2 transition-transform duration-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Goal / Raised
            </p>
            <p className="font-semibold text-lg">
              {campaign.requiredAmount ?? "0"} /{" "}
              {campaign.receivedAmount ?? "0"} ETH
            </p>
          </div>
        </div>
        <div>{getStatusUI()}</div>
      </div>

      {requiredAction && (
        <button
          onClick={() => handleAction(requiredAction)}
          disabled={isTxLoading}
          className={`w-full flex items-center justify-center px-4 py-2 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-md 
            ${
              isTxLoading
                ? "bg-gray-500"
                : requiredAction.includes("Finalize")
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {isTxLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {isTxLoading ? "Confirming..." : requiredAction}
        </button>
      )}

      {!requiredAction && isOver && !campaign.isFinalized && (
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-500 text-white font-medium rounded-lg transition-opacity duration-300 opacity-70 cursor-not-allowed"
        >
          Action Not Available Yet
        </button>
      )}
    </div>
  );
};

export default ManagementCard;
