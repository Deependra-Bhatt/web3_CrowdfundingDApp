// src\components\Home\CampaignCard.js
"use client";

import { Clock, DollarSign, Target, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatTimeRemaining, convertIPFSURIToHTTP } from "@/utils";

const IPFS_BASE_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

//  Renders a single Campaign Card.
const CampaignCard = ({ campaign }) => {
  const progress = (campaign.receivedAmount / campaign.requiredAmount) * 100;
  const isSuccessful = campaign.receivedAmount >= campaign.requiredAmount;
  const isOver = campaign.timeRemaining <= 0;

  let statusText;
  let statusColor;
  let statusIcon;

  if (!isOver) {
    statusText = "Active";
    statusColor = "bg-lime-500 text-white";
    statusIcon = <Clock className="w-4 h-4" />;
  } else if (isOver && isSuccessful) {
    statusText = "Successful";
    statusColor = "bg-blue-600 text-white";
    statusIcon = <CheckCircle className="w-4 h-4" />;
  } else if (isOver && !isSuccessful) {
    statusText = "Failed";
    statusColor = "bg-red-600 text-white";
    statusIcon = <XCircle className="w-4 h-4" />;
  }

  const displayTime = formatTimeRemaining(campaign.timeRemaining);
  const imageUrl = convertIPFSURIToHTTP(campaign.imageURI, IPFS_BASE_URL);

  return (
    <Link
      href={`/campaign/${campaign.address}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {/* Image */}
      <div className="h-48 w-full bg-gray-300 dark:bg-gray-700 relative">
        <img
          src={imageUrl}
          alt={campaign.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-md ${statusColor} transition duration-300 hover:scale-105`}
        >
          {statusIcon}
          <span className="ml-1">{statusText}</span>
        </span>
      </div>
      <div className="p-5">
        {/* Title and Description */}
        <h3 className="text-xl font-bold mb-2 truncate text-gray-900 dark:text-gray-50">
          {campaign.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out${
                progress >= 100 ? "bg-blue-500" : "bg-lime-500"
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-sm font-medium mt-1 text-right text-gray-700 dark:text-gray-300">
            {progress.toFixed(2)}% Funded
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 text-sm font-medium border-t pt-4 border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <DollarSign className="w-4 h-4 text-lime-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Raised
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {campaign.receivedAmount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Goal
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {campaign.requiredAmount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Time Left
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {displayTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
