// src\app\dashboard\page.js
import DashboardClient from "../../components/Dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard | LUMILIGHT",
  description:
    "Manage your crowdfunding campaigns, register as a creator, and finalize successful projects.",
};

export default function DashboardPage() {
  return (
    <div className="pt-7 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-8 text-center">
        Dashboard
      </h1>

      <DashboardClient />
    </div>
  );
}
