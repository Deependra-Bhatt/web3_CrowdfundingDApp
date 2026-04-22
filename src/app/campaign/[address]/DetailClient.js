"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../../../components/Web3Context";
import ContributorWall from "@/components/Campaign/ContributorWall";
import { ethers, Contract } from "ethers";
import {
  Clock,
  User,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  Share2,
  Info,
  AlertTriangle,
  Calendar,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  convertIPFSURIToHTTP,
  formatTimeRemaining,
  shortenAddress,
} from "@/utils";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL ||
  "https://gateway.pinata.cloud/ipfs/";

const DetailClient = ({ initialData }) => {
  const { address, signer, provider, campaignAbi, connectWallet } = useWeb3();
  const [campaign, setCampaign] = useState(initialData);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [newDeadlineInput, setNewDeadlineInput] = useState("");
  const [contributedAmount, setContributedAmount] = useState(0);
  const [storyContent, setStoryContent] = useState("Loading campaign story...");
  const [recentContributors, setRecentContributors] = useState([]);
  const [txStep, setTxStep] = useState(0);

  // --- Computed States ---
  const isOwner =
    address && address.toLowerCase() === campaign.owner.toLowerCase();
  const isOver = campaign.timeRemaining <= 0;
  const received = parseFloat(campaign.receivedAmount);
  const required = parseFloat(campaign.requiredAmount);
  const isSuccessful = received >= required;
  const progress = (received / required) * 100;
  const remainingNeeded = Math.max(0, required - received);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#84cc16", "#10b981", "#3b82f6"],
    });
  };

  const handleShare = () => {
    const text = `Support ${campaign.title} on Lumilight!`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
  };

  // --- Data Fetching & Sync ---
  const fetchData = useCallback(async () => {
    if (!provider) return;
    try {
      const contract = new Contract(campaign.address, campaignAbi, provider);
      const [rev, withdr, dead, ext] = await Promise.all([
        contract.receivedAmount(),
        contract.withdrawn(),
        contract.deadline(),
        contract.deadlineExtended?.() || false,
      ]);

      setCampaign((prev) => ({
        ...prev,
        receivedAmount: ethers.formatEther(rev),
        withdrawn: withdr,
        deadline: Number(dead),
        deadlineExtended: ext,
      }));

      if (address) {
        const amount = await contract.contributors(address);
        setContributedAmount(ethers.formatEther(amount));
      }

      const filter = contract.filters.Donation();
      const logs = await contract.queryFilter(filter, -10000, "latest");
      setRecentContributors(
        logs
          .map((log) => ({
            address: log.args[0],
            amount: ethers.formatEther(log.args[1]),
            blockNumber: log.blockNumber,
          }))
          .reverse(),
      );
    } catch (e) {
      console.error("Sync Error:", e);
    }
  }, [address, provider, campaign.address, campaignAbi]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCampaign((prev) => ({
        ...prev,
        timeRemaining: Math.max(
          0,
          prev.deadline - Math.floor(Date.now() / 1000),
        ),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  useEffect(() => {
    fetch(convertIPFSURIToHTTP(campaign.description, PINATA_GATEWAY_URL))
      .then((res) => res.text())
      .then(setStoryContent)
      .catch(() => setStoryContent("Description loaded from IPFS."));
  }, [campaign.description]);

  const executeTransaction = async (contractFunction, label) => {
    if (!signer) return connectWallet();
    setIsTxLoading(true);
    setTxStep(1);
    try {
      const contract = new Contract(campaign.address, campaignAbi, signer);

      // --- Define Overrides Here  for gas fees---
      const overrides = {
        maxPriorityFeePerGas: ethers.parseUnits("26", "gwei"),
        maxFeePerGas: ethers.parseUnits("50", "gwei"),
      };

      const tx = await contractFunction(contract, overrides);
      setTxStep(2);
      toast.loading(`Mining ${label}...`, { id: "tx" });
      await tx.wait();
      setTxStep(3);
      toast.success(`${label} successful!`, { id: "tx" });
      if (label === "Donation") fireConfetti();
      await fetchData();
      setDonationAmount("");
    } catch (e) {
      toast.error(e.reason || "Transaction failed", { id: "tx" });
    } finally {
      setTimeout(() => {
        setIsTxLoading(false);
        setTxStep(0);
      }, 3000);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: Media, Story, and Withdraw/Refund */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. RESTORED: Image with Zoom Effect */}
          <div className="relative group rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl">
            <img
              src={convertIPFSURIToHTTP(campaign.imageURI, PINATA_GATEWAY_URL)}
              className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Campaign"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <button
              onClick={handleShare}
              className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/40 transition-all text-white shadow-lg"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Story Content */}
          <div className="p-8 bg-black/5 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <ShieldCheck className="w-6 h-6 text-lime-600 dark:text-lime-400" />{" "}
              Campaign Story
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-400 leading-relaxed font-medium">
              {storyContent}
            </div>
          </div>

          {/* 3. NEW POSITION: Management Console (Withdraw / Refund) */}
          {(isOwner || contributedAmount > 0) && (
            <div className="p-8 bg-lime-500/5 dark:bg-lime-500/5 backdrop-blur-3xl rounded-3xl border border-lime-500/20 space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                  Management Console
                </h3>
                {isOwner && (
                  <span className="text-[10px] px-2 py-1 bg-lime-500 text-black rounded font-bold">
                    CREATOR
                  </span>
                )}
              </div>

              {!isOver && isOwner && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You can Withdraw when deadline is over
                </p>
              )}

              {/* Withdraw Logic */}
              {isOwner && isOver && isSuccessful && !campaign.withdrawn && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Goal met! You can now withdraw the campaign funds to your
                    wallet.
                  </p>
                  <button
                    onClick={() =>
                      executeTransaction(
                        (contract, overrides) =>
                          contract.withdrawFunds(overrides),
                        "Withdrawal",
                      )
                    }
                    className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-black rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" /> Withdraw
                    {campaign.receivedAmount} ETH
                  </button>
                </div>
              )}

              {/* Refund Logic */}
              {!isSuccessful && isOver && contributedAmount > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Campaign did not reach its goal. Claim your refund below.
                  </p>
                  <button
                    onClick={() =>
                      executeTransaction(
                        (contract, overrides) => contract.refund(overrides),
                        "Refund",
                      )
                    }
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-5 h-5" /> Claim Refund (
                    {contributedAmount} ETH)
                  </button>
                </div>
              )}

              {campaign.withdrawn && isOwner && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-gray-400 text-gray-400 justify-center">
                  <CheckCircle className="w-5 h-5" /> Funds have been withdrawn
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Title, Progress, and Support */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-[70%]">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                  {campaign.title}
                </h1>
                <p className="text-xs text-lime-600 dark:text-lime-400 font-mono font-bold flex items-center gap-1 uppercase tracking-wider">
                  <User className="w-3 h-3" /> BY:{" "}
                  {shortenAddress(campaign.owner)}
                </p>
              </div>
              {/* RESTORED: Pulsing Live Indicator */}
              <div
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border flex items-center gap-2 ${
                  isOver
                    ? "border-rose-500/50 text-rose-600 bg-rose-500/10"
                    : "border-lime-500/50 text-lime-600 bg-lime-500/10"
                }`}
              >
                {isOver ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Ended{" "}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />{" "}
                    Live
                  </>
                )}
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest mb-1">
                    Raised
                  </span>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {campaign.receivedAmount}{" "}
                    <span className="text-lg text-gray-400 font-medium">
                      ETH
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 dark:text-white/40 font-bold uppercase tracking-widest mb-1">
                    Target
                  </span>
                  <p className="text-lg font-bold text-gray-800 dark:text-white/80">
                    {campaign.requiredAmount} ETH
                  </p>
                </div>
              </div>

              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden p-1 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 transition-all duration-1000 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-tighter">
                <span>{progress.toFixed(1)}% Funded</span>
                <span>{formatTimeRemaining(campaign.timeRemaining)} left</span>
              </div>
            </div>

            {/* Contribution Form */}
            {!isOver ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 px-6 text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all shadow-inner"
                    placeholder="0.00"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-white/20">
                    ETH
                  </span>
                </div>

                {parseFloat(donationAmount) > remainingNeeded &&
                  remainingNeeded > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Note: Overfunding by{" "}
                      {(parseFloat(donationAmount) - remainingNeeded).toFixed(
                        4,
                      )}{" "}
                      ETH.
                    </div>
                  )}

                <button
                  onClick={() =>
                    executeTransaction(
                      (contract, overrides) =>
                        contract.donate({
                          ...overrides,
                          value: ethers.parseEther(donationAmount),
                        }),
                      "Donation",
                    )
                  }
                  disabled={
                    isTxLoading ||
                    !donationAmount ||
                    parseFloat(donationAmount) <= 0
                  }
                  className="w-full bg-lime-500 hover:bg-lime-400 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-lime-500/20 active:scale-95"
                >
                  {isTxLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Back Project{" "}
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </>
                  )}
                </button>

                {/* FIXED STEPPER LOGIC */}
                {isTxLoading && txStep > 0 && (
                  <div className="flex justify-between px-4 pt-2 animate-fade-in">
                    {[
                      { l: "SIGN", s: 1 },
                      { l: "MINE", s: 2 },
                      { l: "DONE", s: 3 },
                    ].map((step) => (
                      <div
                        key={step.l}
                        className={`flex flex-col items-center gap-1.5 transition-colors duration-500 ${
                          txStep >= step.s
                            ? "text-lime-600 dark:text-lime-400"
                            : "text-gray-300 dark:text-white/10"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full bg-current transition-all duration-500 ${
                            txStep === step.s
                              ? "animate-pulse scale-125 shadow-[0_0_8px_currentColor]"
                              : ""
                          }`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                          {step.l}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-500 dark:text-white/60 text-center font-bold flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> Contributions are closed
              </div>
            )}

            {/* Extend Deadline UI (Kept in Right Column) */}
            {isOwner && !isOver && !campaign.deadlineExtended && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> One-Time Extension
                </h4>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={newDeadlineInput}
                    onChange={(e) => setNewDeadlineInput(e.target.value)}
                    className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-lime-500"
                  />
                  <button
                    onClick={() => {
                      const unix = Math.floor(
                        new Date(newDeadlineInput).getTime() / 1000,
                      );
                      if (unix > campaign.deadline + 604800)
                        return toast.error("Max 7 days!");
                      executeTransaction(
                        (contract, overrides) =>
                          contract.extendDeadline(unix, overrides),
                        "Extension",
                      );
                    }}
                    className="bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:opacity-80 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wall of Fame */}
          <div className="p-8 bg-gray-50/50 dark:bg-white/5 backdrop-blur-3xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg">
            <ContributorWall contributors={recentContributors} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailClient;
