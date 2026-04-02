// src/components/Campaign/ContributorWall.js

"use client";

import React from "react";
import { Copy, ExternalLink, Trophy, Medal } from "lucide-react";
import { shortenAddress } from "@/utils";
import toast from "react-hot-toast";

const ContributorWall = ({ contributors }) => {
  // If no contributors yet
  if (!contributors || contributors.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl">
        <p className="text-gray-500 dark:text-white/40 italic font-medium">
          No contributors yet. Be the first to lead the way!
        </p>
      </div>
    );
  }

  const copyToClipboard = (addr) => {
    navigator.clipboard.writeText(addr);
    toast.success("Address copied!", {
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500 shadow-sm" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Champions
          </h3>
        </div>
        <span className="text-[10px] font-black bg-lime-500/10 text-lime-600 dark:text-lime-400 px-2 py-1 rounded-md border border-lime-500/20">
          TOP 5
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {contributors.slice(0, 5).map((contributor, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-4 
                       bg-black/[0.03] dark:bg-white/5 
                       hover:bg-black/[0.06] dark:hover:bg-white/10 
                       border border-black/[0.05] dark:border-white/5 
                       rounded-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              {/* Unique Avatar Container */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-lime-500/30 bg-gray-200 dark:bg-white/10 shadow-sm">
                  <img
                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${contributor.address}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {index === 0 && (
                  <Medal className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                  {shortenAddress(contributor.address)}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                  <p className="text-xs text-gray-500 dark:text-white/40 font-mono font-bold">
                    {contributor.amount} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyToClipboard(contributor.address)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-gray-400 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all"
                title="Copy Address"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={`https://amoy.polygonscan.com/address/${contributor.address}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-gray-400 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-black/[0.05] dark:border-white/5">
        <p className="text-[9px] text-center text-gray-400 dark:text-white/20 uppercase tracking-[0.3em] font-black">
          Transparency via Polygon Amoy
        </p>
      </div>
    </div>
  );
};

export default ContributorWall;
