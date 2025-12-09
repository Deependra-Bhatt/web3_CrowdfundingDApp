// src/components/Web3Context.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, JsonRpcProvider, Contract, ethers } from "ethers";
import CampaignFactory from "../../artifacts/contracts/CampaignFactory.sol/CampaignFactory.json";
import Campaign from "../../artifacts/contracts/Campaign.sol/Campaign.json";
import { useNotification } from "./NotificationContext";
import { shortenAddress } from "@/utils";
import toast from "react-hot-toast";

const Web3Context = createContext();

// Configuration 
const TARGET_CHAIN_ID = 80002;
const TARGET_CHAIN_NAME = "Amoy Testnet";
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_ADDRESS;
const FACTORY_ABI = CampaignFactory.abi;
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology/";
// End Configuration 


export const Web3Provider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification: notify} = useNotification();

  // value to expose the campaign ABI
  const campaignAbi = Campaign.abi;

  // 1. Connect Wallet and set up Ethers objects
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        // Request account access and get provider/signer
        const web3Provider = new BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const newSigner = await web3Provider.getSigner();
        const newNetwork = await web3Provider.getNetwork();

        // Check for correct network
        if (Number(newNetwork.chainId) !== TARGET_CHAIN_ID) {
          notify(
            `Wrong Network: Please switch to the ${TARGET_CHAIN_NAME} (ID: ${TARGET_CHAIN_ID}).`,
            "error",
            7000
          );
          setAddress(null);
          setSigner(null);
          setNetwork(null);
          return;
        }

        toast.success(`Wallet connected: ${shortenAddress(accounts[0])}`);
        setAddress(accounts[0]);
        setSigner(newSigner);
        setNetwork(newNetwork);

        // Instantiate Factory Contract (using signer for write operations)
        const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, newSigner);
        setFactoryContract(factory);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast.error(
          "Failed to connect wallet."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      notify(
        "Wallet Extension not detected. Please install MetaMask.",
        "error",
        7000
      );
    }
  };

  // 2. Initialize Read-Only Provider 
  useEffect(() => {
    const rpcProvider = new JsonRpcProvider(RPC_URL);
    setProvider(rpcProvider);

    // Instantiate Factory Contract (using read-only provider for initial reads)
    const readOnlyFactory = new Contract(
      FACTORY_ADDRESS,
      FACTORY_ABI,
      rpcProvider
    );
    if (!factoryContract) setFactoryContract(readOnlyFactory);

    setIsLoading(false);
  }, []);

  // 3. Handle Account/Chain Changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          connectWallet(); 
        } else {
          toast.error("Wallet disconnected.");
          setAddress(null);
          setSigner(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload(); 
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        provider, 
        signer, 
        network,
        factoryContract, 
        campaignAbi,
        isLoading,
        connectWallet,
        targetChain: TARGET_CHAIN_NAME,
        targetChainId: TARGET_CHAIN_ID,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
