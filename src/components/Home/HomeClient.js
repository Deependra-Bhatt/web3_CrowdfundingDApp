// src/components/Home/HomeClient.js

"use client";

import React, { useState, useEffect, useMemo } from "react";
import CampaignCard from "@/components/Home/CampaignCard";
import { Filter } from "lucide-react";
import PaginationControls from "./PaginationControls";

// --- Configuration ---
const campaignsPerPage = 12;

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
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
        filter === value
          ? "bg-lime-500 text-white shadow-lg scale-105"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-lime-100 dark:hover:bg-lime-900 hover:scale-[1.02]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* --- Filter and Pagination Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        {/* Filter Buttons */}
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <Filter className="w-5 h-5 text-lime-500" />
          <FilterButton value="all" label="All" />
          <FilterButton value="active" label="Active" />
          <FilterButton value="successful" label="Successful" />
          <FilterButton value="failed" label="Failed" />
        </div>

        {/* Total Count and Pagination */}
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 whitespace-nowrap">
            {totalCampaignsInFilter} results
          </h2>
          {/* {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )} */}
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
