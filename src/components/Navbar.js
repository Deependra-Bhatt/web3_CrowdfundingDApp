// src\components\Navbar.js

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useWeb3 } from "./Web3Context";
import { useTheme } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { useNotification } from "./NotificationContext";
import { shortenAddress } from "@/utils";
import { Wallet, CircleCheck, AlertTriangle, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

/**
 * The navigation bar component that handles:-
 * wallet connection status, creator registration, and theme toggle.
 */
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

  // Check Creator Status
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (factoryContract && address) {
        setIsCheckingCreator(true);
        try {
          // Check if the current address is a registered creator
          const status = await factoryContract.isCreator(address);
          setIsCreator(status);
        } catch (error) {
          console.error("Error checking creator status:", error);
          // If the contract call fails, assume not a creator or a contract issue
          setIsCreator(false);
        } finally {
          setIsCheckingCreator(false);
        }
      } else {
        setIsCreator(false);
      }
    };

    checkCreatorStatus();
  }, [factoryContract, address]);

  // Handle Creator Registration
  const handleRegisterCreator = async () => {
    if (!signer || !factoryContract) {
      notify("Please connect your wallet first.");
      return;
    }

    setIsRegistering(true);
    try {
      // Execute the registration transaction using the signer
      const tx = await factoryContract.registerAsCreator();
      await tx.wait();

      setIsCreator(true);
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Error registering creator:", error);
      toast.error("Registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Determine Connection Status
  const isConnected = !!address && !!signer;
  const isWrongNetwork =
    isConnected && network?.name !== targetChain.toLowerCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 shadow-lg bg-white dark:bg-gray-900/90 backdrop-blur-md transition-all duration-500 animate-fade-in-down border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <Link
            href="/"
            className="flex items-center space-x-2 transition-transform duration-300 hover:scale-[1.05]"
          >
            <span
              className={`text-2xl font-extrabold tracking-tight bg-clip-text text-transparent ${
                theme === "light"
                  ? "bg-gradient-to-r from-yellow-500 to-lime-600"
                  : "bg-gradient-to-r from-lime-400 to-yellow-300"
              }`}
            >
              LUMILIGHT
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-lime-500 after:transition-all after:duration-300"
            >
              Campaigns
            </Link>
            <Link
              href="/create-campaign"
              className="text-gray-600 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-lime-500 after:transition-all after:duration-300"
            >
              Create
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-lime-500 after:transition-all after:duration-300"
            >
              Dashboard
            </Link>
          </div>

          {/* Right Side: Wallet Status, Creator, Theme */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Creator Status/Register Button */}
            {isConnected && (
              <div className="hidden sm:block">
                {isCheckingCreator ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Checking...
                  </span>
                ) : isCreator ? (
                  <span className="flex items-center text-sm font-semibold text-lime-600 dark:text-lime-400 p-2 rounded-full bg-lime-100 dark:bg-lime-900/50 transition-all duration-300 hover:scale-[1.02]">
                    <CircleCheck className="w-4 h-4 mr-1" /> Creator
                  </span>
                ) : (
                  <button
                    onClick={handleRegisterCreator}
                    disabled={isRegistering}
                    className="flex items-center text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 disabled:bg-lime-700/50 rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-md shadow-lime-500/30"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {isRegistering ? "Registering..." : "Register Creator"}
                  </button>
                )}
              </div>
            )}

            {/* Wallet Connection Status*/}
            <div className="relative">
              {isConnected ? (
                <div
                  className={`flex items-center text-sm font-medium rounded-full py-1.5 px-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    isWrongNetwork
                      ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50"
                      : "bg-lime-100 dark:bg-lime-800/50 text-lime-700 dark:text-lime-400 hover:bg-lime-200 dark:hover:bg-lime-700/50"
                  }`}
                  title={
                    isWrongNetwork
                      ? `Switch to ${targetChain}`
                      : `Connected to ${network?.name}`
                  }
                >
                  {isWrongNetwork ? (
                    <AlertTriangle className="w-4 h-4 mr-1.5 animate-wiggle-once" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-1.5" />
                  )}
                  {shortenAddress(address)}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-md shadow-blue-500/30"
                >
                  <Wallet
                    className={`w-4 h-4 mr-1.5 ${
                      isLoading ? "animate-pulse" : ""
                    }`}
                  />
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
