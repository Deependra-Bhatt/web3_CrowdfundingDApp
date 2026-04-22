"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "./Web3Context";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Image as ImageIcon,
  DollarSign,
  Loader2,
  UserX,
  Tag,
  RocketIcon,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";
import { ethers } from "ethers";
import { uploadDataToPinata } from "../utils/pinata";
import toast from "react-hot-toast";
import { convertDeadlineToUnix } from "@/utils";

const PLATFORM_FEE_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_ADDRESS;

const CreateCampaignForm = () => {
  const { address, signer, factoryContract, isLoading, connectWallet } =
    useWeb3();
  const router = useRouter();

  const [step, setStep] = useState(1);
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
  const [isCheckingCreator, setIsCheckingCreator] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (factoryContract && address) {
        try {
          const status = await factoryContract.isCreator(address);
          setIsCreator(status);
        } catch (err) {
          console.error(err);
        } finally {
          setIsCheckingCreator(false);
        }
      } else {
        setIsCheckingCreator(false);
      }
    };
    checkStatus();
  }, [factoryContract, address]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setForm((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canGoToNextStep = () => {
    if (step === 1)
      return form.title.trim() !== "" && form.description.trim() !== "";
    if (step === 2)
      return (
        form.requiredAmount !== "" &&
        form.category !== "" &&
        form.deadline !== ""
      );
    return true;
  };

  const handleSubmit = async () => {
    if (!canGoToNextStep() || !form.imageFile) {
      toast.error("Please complete all fields and upload an image.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

    setIsSubmitting(true);
    const toastId = toast.loading("Preparing assets...");

    try {
      toast.loading("Uploading story to IPFS...", { id: toastId });
      const descriptionCID = await uploadDataToPinata(
        form.description,
        "story.txt",
        apiKey,
        apiSecret,
      );

      toast.loading("Uploading image to IPFS...", { id: toastId });
      const imageCID = await uploadDataToPinata(
        form.imageFile,
        form.imageFile.name,
        apiKey,
        apiSecret,
      );

      const deadlineUnix = convertDeadlineToUnix(form.deadline);
      const requiredAmountWei = ethers.parseEther(
        form.requiredAmount.toString(),
      );

      toast.loading("Requesting Signature...", { id: toastId });
      const tx = await factoryContract.createCampaign(
        form.title,
        requiredAmountWei,
        `ipfs://${imageCID}`,
        form.category,
        `ipfs://${descriptionCID}`,
        deadlineUnix,
        PLATFORM_FEE_ADDRESS,
        {
          // Manually setting gas fees to satisfy the network
          maxPriorityFeePerGas: ethers.parseUnits("26", "gwei"),
          maxFeePerGas: ethers.parseUnits("50", "gwei"),
        },
      );

      toast.loading("Mining Campaign...", { id: toastId });
      await tx.wait();

      toast.success("Campaign Successfully Launched!", { id: toastId });
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "Blockchain Transaction Failed", {
        id: toastId,
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading || isCheckingCreator)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
        <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">
          Securing Connection...
        </p>
      </div>
    );

  // Handle Non-Creator State
  if (!isCreator) {
    return (
      <div className="p-12 text-center bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="p-6 bg-red-500/10 rounded-full">
            <UserX className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Not Registered as Creator
            </h2>
            <p className="text-gray-500 dark:text-white/60 max-w-sm mx-auto">
              You need to register your profile before you can launch a
              campaign.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")} // Adjust route if your dashboard is elsewhere
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            Go to Dashboard <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  // Main Form (Only shown if isCreator is true)
  return (
    <div className="p-1 bg-white/70 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl transition-all duration-500">
      <div className="p-8 md:p-12">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= s
                  ? "flex-1 bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                  : "w-4 bg-gray-200 dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Vision */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                Campaign Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-2xl text-lg font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-lime-500/50 transition-all"
                placeholder="Project name..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-lime-500/50 transition-all resize-none"
                placeholder="Explain your vision..."
              />
            </div>
          </div>
        )}

        {/* STEP 2: Goal & Logistics */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                  Goal (ETH) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500" />
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    name="requiredAmount"
                    value={form.requiredAmount}
                    onChange={handleChange}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-lime-500/50"
                    placeholder="0.1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500 pointer-events-none" />
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-lime-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="dark:bg-gray-900">
                      Select Category
                    </option>
                    <option value="Art" className="dark:bg-gray-900">
                      Art
                    </option>
                    <option value="Tech" className="dark:bg-gray-900">
                      Tech
                    </option>
                    <option value="Charity" className="dark:bg-gray-900">
                      Charity
                    </option>
                    <option value="Other" className="dark:bg-gray-900">
                      Other
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-white/40 mb-2">
                Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-500 pointer-events-none" />
                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 pl-12 rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-lime-500/50 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Media & Preview */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl group hover:border-lime-500/50 transition-all cursor-pointer relative overflow-hidden bg-black/[0.02] dark:bg-white/[0.02]">
              {imagePreview && (
                <img
                  src={imagePreview}
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                  alt="Preview"
                />
              )}
              <input
                type="file"
                name="imageFile"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4 group-hover:text-lime-500 transition-colors" />
              <p className="font-bold text-gray-500 dark:text-white/40 text-center">
                Upload Campaign Cover *<br />
                <span className="text-xs font-normal">
                  (Required to Launch)
                </span>
              </p>
            </div>

            <div className="p-6 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 mb-4 flex items-center gap-2">
                <Eye className="w-3 h-3" /> Real-time Preview
              </h4>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-white/10 overflow-hidden shadow-inner">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-black text-gray-900 dark:text-white truncate">
                    {form.title || "Untitled Vision"}
                  </p>
                  <p className="text-xs font-bold text-lime-600 dark:text-lime-400">
                    {form.requiredAmount || "0.0"} ETH Goal
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:-translate-x-1"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (canGoToNextStep()) setStep(step + 1);
                else toast.error("Please fill in all fields.");
              }}
              className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-4 bg-lime-500 text-black rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-lime-500/20 disabled:bg-gray-400 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <RocketIcon className="w-5 h-5" /> Launch Now
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignForm;
