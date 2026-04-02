// src\app\dashboard\page.js
import DashboardClient from "../../components/Dashboard/DashboardClient";
import { LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Dashboard | LUMILIGHT",
  description:
    "Manage your crowdfunding campaigns, register as a creator, and finalize successful projects.",
};

export default function DashboardPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto min-h-screen space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 animate-fade-in-down">
        <div className="p-3 bg-lime-500/10 rounded-2xl border border-lime-500/20 text-lime-600 dark:text-lime-400">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Creator <span className="text-lime-500">Dashboard</span>
        </h1>
        <p className="text-gray-500 dark:text-white/40 font-medium max-w-lg">
          Monitor your success, manage registrations, and claim your hard-earned
          project funds.
        </p>
      </div>

      <DashboardClient />
    </div>
  );
}
