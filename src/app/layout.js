// src/app/layout.js

import "./globals.css";
import { Inter } from "next/font/google";
import { Web3Provider } from "../components/Web3Context";
import { ThemeProvider } from "../components/ThemeContext";
import { NotificationProvider } from "../components/NotificationContext"; 
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LUMILIGHT: Decentralized Crowdfunding",
  description: "Secure, deadline-based crowdfunding on the blockchain.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors duration-300`}
      >
        <ThemeProvider>
          <NotificationProvider>
            <Web3Provider>
              <Navbar />
              <main className="min-h-screen pt-20 container mx-auto p-4 md:p-8">
                {children}
              </main>
              <Toaster position="top-center" />
            </Web3Provider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
