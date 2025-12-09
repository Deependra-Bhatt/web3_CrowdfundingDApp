// src\components\CreateCampaignForm.js
"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "./Web3Context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Image,
  DollarSign,
  Loader2,
  UserX,
  Tag,
  RocketIcon,
} from "lucide-react";
import { ethers } from "ethers";
import { uploadDataToPinata } from "../utils/pinata";
import toast from "react-hot-toast";
import { convertDeadlineToUnix } from "@/utils";

// CONFIGURATION CONSTANTS
const PLATFORM_FEE_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_ADDRESS;

const CreateCampaignForm = () => {
  const { address, signer, factoryContract, isLoading, connectWallet } =
    useWeb3();

  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredAmount: "",
    deadline: "",
    category: "",
    imageFile: null,
  });

  const [isCreator, setIsCreator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingCreator, setIsCheckingCreator] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pinataKeys, setPinataKeys] = useState({ apiKey: "", apiSecret: "" });

  // Step 1: Check Creator Status & Load Pinata Keys
  useEffect(() => {
    const checkStatusAndLoadKeys = async () => {
      // Load Pinata Keys
      const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
      const apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

      if (apiKey && apiSecret) {
        setPinataKeys({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });
      } else {
        console.error(
          "FATAL: Pinata Keys not loaded. Check .env.local and NEXT_PUBLIC_ prefix."
        );
        toast.error("Pinata credentials missing. Check console.");
      }

      // Check Creator Status
      if (factoryContract && address) {
        try {
          const status = await factoryContract.isCreator(address);
          setIsCreator(status);
        } catch (err) {
          console.error("Error checking creator status:", err);
          setError("Failed to verify creator status. Check console.");
        } finally {
          setIsCheckingCreator(false);
        }
      } else {
        setIsCheckingCreator(false);
      }
    };
    checkStatusAndLoadKeys();
  }, [factoryContract, address]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError("");
  };

  const validateForm = () => {
    const { title, description, requiredAmount, deadline, category } = form;
    if (!title || !description || !requiredAmount || !deadline || !category) {
      setError("Please fill out all required fields.");
      return false;
    }
    if (isNaN(parseFloat(requiredAmount)) || parseFloat(requiredAmount) <= 0) {
      setError("Required amount must be a positive number.");
      return false;
    }
    return true;
  };

  // Step 3: Handle Submission & Transaction (with IPFS Upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !signer || !factoryContract) return;

    if (!isCreator) {
      setError("You must be a registered Creator to launch a campaign.");
      return;
    }

    const { apiKey, apiSecret } = pinataKeys;
    if (!apiKey || !apiSecret) {
      setError("Pinata credentials missing. Cannot upload files.");
      return;
    }

    setIsSubmitting(true);
    setUploadLoading(true);
    setError("");

    let imageCID = "";
    let descriptionCID = "";

    try {
      // --- 3.1 IPFS Uploads ---

      // 1. Upload Description (Story)
      toast.loading("Uploading Campaign Description to IPFS...", {
        id: "desc-upload",
      });
      try {
        descriptionCID = await uploadDataToPinata(
          form.description, // String content
          "campaign-story.txt",
          apiKey,
          apiSecret
        );
        toast.success("Description Uploaded!", { id: "desc-upload" });
      } catch (error) {
        toast.error("Failed to upload Description.", { id: "desc-upload" });
        throw new Error(`Description upload failed: ${error.message}`);
      }

      // 2. Upload Image
      if (form.imageFile) {
        toast.loading("Uploading Project Image to IPFS...", {
          id: "image-upload",
        });
        try {
          imageCID = await uploadDataToPinata(
            form.imageFile, // File object
            form.imageFile.name,
            apiKey,
            apiSecret
          );
          toast.success("Image Uploaded!", { id: "image-upload" });
        } catch (error) {
          toast.error("Failed to upload Image.", { id: "image-upload" });
          throw new Error(`Image upload failed: ${error.message}`);
        }
      } else {
        toast("No image selected, please upload image.", { icon: "🖼️" });
      }
      setUploadLoading(false);

      // --- 3.2 Prepare Contract Arguments ---
      const requiredAmountWei = ethers.parseEther(
        form.requiredAmount.toString()
      );
      const deadlineUnix = convertDeadlineToUnix(form.deadline);

      if (deadlineUnix <= Math.floor(Date.now() / 1000)) {
        setError("The campaign deadline must be set in the future.");
        setIsSubmitting(false);
        return;
      }

      // Storing the CID (`ipfs://<CID>`) is best development practice
      const campaignImageURI = imageCID ? `ipfs://${imageCID}` : "";
      const campaignStoryURI = `ipfs://${descriptionCID}`;

      toast.loading("Sending Transaction...", { id: "tx-send" });

      // --- 3.3 Execute the Transaction ---
      const tx = await factoryContract.createCampaign(
        form.title,
        requiredAmountWei,
        campaignImageURI,
        form.category,
        campaignStoryURI,
        deadlineUnix,
        PLATFORM_FEE_ADDRESS
      );

      // Wait for the transaction to be mined
      await tx.wait();

      toast.success("Campaign Created Successfully!", { id: "tx-send" });
      router.push("/");
    } catch (err) {
      setUploadLoading(false);
      console.error("Campaign Creation Error:", err);
      const userMessage =
        err.reason ||
        "Transaction failed due to an error. Please check console";
      setError(userMessage);
      toast.dismiss("tx-send");
      toast.error("Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Conditional Rendering based on Web3 Status (Unchanged) ---
  if (isLoading || isCheckingCreator) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin-slow mr-3" />
        {isLoading
          ? "Waiting for Web3 connection..."
          : "Checking Creator status..."}
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl animate-fade-in-down">
        <p className="text-xl font-semibold text-red-500 mb-4">
          Wallet Disconnected
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please connect your wallet to launch a new campaign.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-[1.05] active:scale-95"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-xl animate-fade-in-down">
        <UserX className="w-12 h-12 text-red-600 mb-4" />
        <p className="text-2xl font-semibold text-red-700 dark:text-red-400 mb-3">
          Creator Registration Required
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
          Only registered creators can launch campaigns. Please register through
          the <b>Dashboard</b> or the <b>Navbar</b> button first.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-lime-500 text-white font-bold rounded-full hover:bg-lime-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-lime-500/50"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Main Form UI
  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl space-y-6 animate-fade-in-up"
    >
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Campaign Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g., Build a community garden"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows="4"
          value={form.description}
          onChange={handleChange}
          required
          placeholder="Describe your project, why it needs funding, and what supporters will receive."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm resize-none"
        />
      </div>

      {/* Required Amount & Category/Deadline Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Amount (Goal) */}
        <div>
          <label
            htmlFor="requiredAmount"
            className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            <DollarSign className="w-4 h-4 inline mr-1 align-sub" /> Required
            Goal (in ETH)
          </label>
          <input
            type="number"
            name="requiredAmount"
            id="requiredAmount"
            value={form.requiredAmount}
            onChange={handleChange}
            required
            step="0.0001"
            min="0.0001"
            placeholder="e.g., 5.0"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
          />
        </div>

        {/* Category Select Field */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            <Tag className="w-4 h-4 inline mr-1 align-sub" /> Category
          </label>
          <select
            name="category"
            id="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="Art">Art</option>
            <option value="Tech">Tech</option>
            <option value="Community">Community</option>
            <option value="Charity">Charity</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deadline (Date/Time Picker) */}
        <div>
          <label
            htmlFor="deadline"
            className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            <Calendar className="w-4 h-4 inline mr-1 align-sub" /> Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            id="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
            // Set minimum to a time slightly in the future to prevent immediate failure
            min={new Date(Date.now() - 60000).toISOString().slice(0, 16)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be converted to a Unix Timestamp (seconds).
          </p>
        </div>

        {/* Image File Upload Field */}
        <div>
          <label
            htmlFor="imageFile"
            className="block text-sm-b font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            <Image className="w-4 h-4 inline mr-1 align-sub" /> Project Image
          </label>
          <input
            type="file"
            name="imageFile"
            id="imageFile"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 focus:ring-lime-500 focus:border-lime-500 focus:shadow-lime-500/40 transition shadow-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium animate-fade-in-down">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isCreator || uploadLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-lime-600 hover:bg-lime-700 disabled:bg-gray-500 disabled:shadow-none transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-lime-500/50"
      >
        {isSubmitting || uploadLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {uploadLoading ? "Uploading to IPFS..." : "Sending Transaction..."}
          </>
        ) : (
          <>
            <RocketIcon className="w-5 h-5 mr-2 group-hover:translate-x-1 transition" />
            Launch Campaign
          </>
        )}
      </button>
    </form>
  );
};

export default CreateCampaignForm;
