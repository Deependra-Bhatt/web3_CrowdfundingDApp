// src\components\Navbar.js

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWeb3 } from "./Web3Context";
import { useTheme } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { useNotification } from "./NotificationContext";
import { shortenAddress } from "@/utils";
import {
  Wallet,
  CircleCheck,
  AlertTriangle,
  UserPlus,
  LayoutDashboard,
  PlusCircle,
  Rocket,
} from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const {
    address,
    signer,
    network,
    factoryContract,
    isLoading,
    connectWallet,
    targetChain,
  } = useWeb3();
  const { theme } = useTheme();
  const [isCreator, setIsCreator] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingCreator, setIsCheckingCreator] = useState(false);
  const { showNotification: notify } = useNotification();

  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (factoryContract && address) {
        setIsCheckingCreator(true);
        try {
          const status = await factoryContract.isCreator(address);
          setIsCreator(status);
        } catch (error) {
          setIsCreator(false);
        } finally {
          setIsCheckingCreator(false);
        }
      }
    };
    checkCreatorStatus();
  }, [factoryContract, address]);

  const handleRegisterCreator = async () => {
    if (!signer || !factoryContract) return notify("Connect wallet first.");
    setIsRegistering(true);
    try {
      const tx = await factoryContract.registerAsCreator();
      await tx.wait();
      setIsCreator(true);
      toast.success("Welcome, Creator!");
    } catch (error) {
      toast.error("Registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  const isConnected = !!address && !!signer;
  const isWrongNetwork =
    isConnected && network?.name !== targetChain.toLowerCase();

  // Reusable Nav Link Component for Desktop to keep code DRY
  const NavLink = ({ href, children }) => (
    <Link
      href={href}
      className="text-gray-500 hover:text-lime-500 dark:text-gray-400 dark:hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-lime-500 after:transition-all after:duration-300 font-semibold"
    >
      {children}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 dark:border-white/10 bg-white/70 dark:bg-[#0a0a0b]/70 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-lime-500 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:rotate-12 transition-transform">
              <Rocket className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              LUMILIGHT
            </span>
          </Link>

          {/* Desktop Links with animated underline */}
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <NavLink href="/">Campaigns</NavLink>
            <NavLink href="/create-campaign">Create</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
          </div>

          {/* Action Area */}
          <div className="flex items-center space-x-3">
            {/* Creator Badge (Desktop) */}
            {isConnected && !isWrongNetwork && (
              <div className="hidden lg:block">
                {isCreator ? (
                  <div className="px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 text-xs font-bold flex items-center">
                    <CircleCheck className="w-3 h-3 mr-1" /> VERIFIED CREATOR
                  </div>
                ) : (
                  <button
                    onClick={handleRegisterCreator}
                    className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-4 py-2 rounded-full hover:scale-105 transition-transform"
                  >
                    BECOME CREATOR
                  </button>
                )}
              </div>
            )}

            {/* Wallet Button */}
            <button
              onClick={!isConnected ? connectWallet : null}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                isWrongNetwork
                  ? "bg-rose-500 text-white"
                  : isConnected
                  ? "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isWrongNetwork ? (
                <AlertTriangle className="w-4 h-4 mr-2" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              {isConnected ? shortenAddress(address) : "Connect"}
            </button>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-2 flex justify-around items-center shadow-2xl">
          <Link
            href="/"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-lime-500"
          >
            <Rocket className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-bold">Explore</span>
          </Link>
          <Link
            href="/create-campaign"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-lime-500"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-bold">Launch</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-lime-500"
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-bold">Stats</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
