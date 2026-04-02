// src\components\Home\CampaignCard.js
"use client";

import {
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { formatTimeRemaining, convertIPFSURIToHTTP } from "@/utils";

const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

const CampaignCard = ({ campaign }) => {
  const progress = (campaign.receivedAmount / campaign.requiredAmount) * 100;
  const isSuccessful = campaign.receivedAmount >= campaign.requiredAmount;
  const isOver = campaign.timeRemaining <= 0;

  // Status mapping for cleaner rendering
  const statusMap = {
    active: {
      text: "Active",
      color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    success: {
      text: "Successful",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    failed: {
      text: "Failed",
      color: "bg-rose-500/20 text-rose-400 border-rose-500/50",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const status = !isOver
    ? statusMap.active
    : isSuccessful
    ? statusMap.success
    : statusMap.failed;
  const imageUrl = convertIPFSURIToHTTP(campaign.imageURI, IPFS_BASE_URL);

  return (
    <Link
      href={`/campaign/${campaign.address}`}
      className="group relative block 
             bg-white/70 dark:bg-white/5 
             backdrop-blur-md 
             border border-gray-200 dark:border-white/10 
             rounded-2xl overflow-hidden 
             hover:border-blue-500/50 dark:hover:border-white/30 
             transition-all duration-500 
             shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] 
             hover:-translate-y-2 animate-fade-in-up"
    >
      {/* Glossy Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image Container */}
      <div className="h-52 w-full relative overflow-hidden">
        <img
          src={imageUrl}
          alt={campaign.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Status Badge - Glass Style */}
        <span
          className={`absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md border ${status.color} shadow-xl`}
        >
          {status.icon}
          {status.text}
        </span>
      </div>

      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-3">
          {/* Title text color fix */}
          <h3 className="text-lg font-bold truncate text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {campaign.title}
          </h3>
          <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            {/* Progress Bar Label fix */}
            <span className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-tighter">
              Progress
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(147,51,234,0.5)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            {/* Stats Grid Text fix */}
            <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase mb-1">
              Raised
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              <span className="text-blue-600 dark:text-blue-400">Ξ</span>{" "}
              {campaign.receivedAmount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase mb-1">Goal</p>
            <p className="text-sm font-semibold text-white/80">
              {campaign.requiredAmount} ETH
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
