// src/components/Home/HomeClient.js

"use client";

import React, { useState, useEffect, useMemo } from "react";
import CampaignCard from "@/components/Home/CampaignCard";
import { Filter } from "lucide-react";
import PaginationControls from "./PaginationControls";

// --- Configuration ---
const campaignsPerPage = 8;

/**
 * Main Client Component for the Homepage grid display.
 */
const HomeClient = ({ initialCampaigns }) => {
  // State for dynamic time remaining updates
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  // State for filtering and pagination
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Filtering and Pagination Logic ---
  const filteredAndPaginatedCampaigns = useMemo(() => {
    // 1. Filtering Logic
    let list = campaigns;

    if (filter === "active") {
      list = list.filter((c) => c.timeRemaining > 0);
    } else if (filter === "successful") {
      list = list.filter((c) => c.isOver && c.isSuccessful);
    } else if (filter === "failed") {
      list = list.filter((c) => c.isOver && !c.isSuccessful);
    }

    // Reset page to 1 if the filter changes, as the total count is different
    if (currentPage > Math.ceil(list.length / campaignsPerPage)) {
      setCurrentPage(1);
    }

    // 2. Pagination Logic
    const indexOfLastCampaign = currentPage * campaignsPerPage;
    const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;

    // Slice the list for the current page
    return list.slice(indexOfFirstCampaign, indexOfLastCampaign);
  }, [campaigns, filter, currentPage]);

  // --- Derived Values for Pagination UI ---
  const totalCampaignsInFilter = useMemo(() => {
    let list = campaigns;
    if (filter === "active") {
      list = list.filter((c) => c.timeRemaining > 0);
    } else if (filter === "successful") {
      list = list.filter((c) => c.isOver && c.isSuccessful);
    } else if (filter === "failed") {
      list = list.filter((c) => c.isOver && !c.isSuccessful);
    }
    return list.length;
  }, [campaigns, filter]);

  const totalPages = Math.ceil(totalCampaignsInFilter / campaignsPerPage);

  // --- Time Remaining Update Logic (from previous step) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCampaigns((prevCampaigns) => {
        const currentTime = Math.floor(Date.now() / 1000);
        return prevCampaigns
          .map((campaign) => {
            const timeRemaining = Math.max(0, campaign.deadline - currentTime);
            const isOver = timeRemaining === 0;

            return {
              ...campaign,
              timeRemaining: timeRemaining,
              isOver: isOver,
            };
          })
          .sort((a, b) => {
            // Re-sort to maintain order after timeRemaining updates
            const getSortValue = (c) => {
              if (c.timeRemaining > 0) return 1;
              if (c.isOver && c.isSuccessful) return 2;
              return 3;
            };

            const sortA = getSortValue(a);
            const sortB = getSortValue(b);

            if (sortA !== sortB) {
              return sortA - sortB;
            }

            if (sortA === 1) {
              return a.timeRemaining - b.timeRemaining;
            } else if (sortA === 2) {
              return b.receivedAmount - a.receivedAmount;
            } else if (sortA === 3) {
              return a.receivedAmount - b.receivedAmount;
            }
            return 0;
          });
      });
    }, 60000 * 10); // Update every 10 minutes

    return () => clearInterval(timer);
  }, []);

  const FilterButton = ({ value, label }) => (
    <button
      onClick={() => {
        setFilter(value);
        setCurrentPage(1);
      }}
      className={`
      px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide
      transition-all duration-300 border
      backdrop-blur-md
      ${
        filter === value
          ? `
            bg-gradient-to-r from-white to-gray-200
            text-black
            border-white/60
            shadow-lg scale-105
          `
          : `
            bg-white/10 dark:bg-white/5
            text-gray-600 dark:text-white/60
            border-white/10
            hover:bg-white/20 hover:text-black dark:hover:text-white
            hover:scale-105
          `
      }
    `}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-10 mt-4">
      {/* Glassmorphic Filter Bar */}
      <div
        className="
    flex flex-col md:flex-row justify-between items-center gap-6 px-6 py-4
    rounded-3xl
    backdrop-blur-2xl
    bg-white/60 dark:bg-white/5
    border border-white/20 dark:border-white/10
    shadow-[0_8px_40px_rgba(0,0,0,0.08)]
    dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]
    relative overflow-hidden
  "
      >
        {/* subtle gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none" />

        {/* Left - Filters */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar z-10">
          <FilterButton value="all" label="All Projects" />
          <FilterButton value="active" label="Live" />
          <FilterButton value="successful" label="Completed" />
          <FilterButton value="failed" label="Expired" />
        </div>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

        {/* Right - Count */}
        <div className="z-10">
          <p className="text-sm font-medium text-gray-600 dark:text-white/50">
            Showing{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {totalCampaignsInFilter}
            </span>{" "}
            campaigns
          </p>
        </div>
      </div>

      {/* Campaign Card Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAndPaginatedCampaigns.length > 0 ? (
          filteredAndPaginatedCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.address}
              className="animate-fade-in-up"
              campaign={campaign}
            />
          ))
        ) : (
          <div className="md:col-span-4 flex justify-center p-10 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No campaigns found for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Pagination at Bottom */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default HomeClient;
