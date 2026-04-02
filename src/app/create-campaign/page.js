// src\app\create-campaign\page.js
import CreateCampaignForm from "../../components/CreateCampaignForm";

export const metadata = {
  title: "Launch a LUMILIGHT Campaign",
  description:
    "Create a new decentralized crowdfunding campaign with a fixed deadline.",
};

import { Rocket } from "lucide-react";

export default function CreateCampaignPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
      <div className="text-center mb-12 space-y-4 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 text-xs font-bold uppercase tracking-widest">
          <Rocket className="w-3 h-3" /> New Campaign
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Launch Your
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-emerald-500">
            Vision
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-gray-500 dark:text-white/40 font-medium">
          Transform your idea into a decentralized reality. Fill in the details
          below to start your journey.
        </p>
      </div>

      <CreateCampaignForm />
    </div>
  );
}
