// src\app\create-campaign\page.js
import CreateCampaignForm from "../../components/CreateCampaignForm";

export const metadata = {
  title: "Launch a LUMILIGHT Campaign",
  description:
    "Create a new decentralized crowdfunding campaign with a fixed deadline.",
};

export default function CreateCampaignPage() {
  return (
    <div className="pt-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-6 text-center">
        Launch Your LUMILIGHT Campaign
      </h1>
      <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-10 animate-fade-in-fast style={{ animationDelay: '200ms' }}">
        Set your goal, describe your vision, and define your deadline.
      </p>

      <CreateCampaignForm />
    </div>
  );
}
