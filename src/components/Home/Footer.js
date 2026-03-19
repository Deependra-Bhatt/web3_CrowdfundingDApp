import React from "react";
import Link from "next/link";
import {
  Github,
  Twitter,
  ExternalLink,
  Heart,
  Globe,
  ShieldCheck,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
              </div>

              <Link
                href="/"
                className="flex items-center space-x-2 transition-transform duration-300 hover:scale-[1.05]"
              >
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                  LUMILIGHT
                </span>
              </Link>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Illuminating the future of decentralized finance. Raise funds,
              support creators, and build communities on the blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link
                  href="/create-campaign"
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  Start Funding
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Developer
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/Deependra-Bhatt/web3_CrowdfundingDApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Source
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Smart Contracts
                </a>
              </li>
              <li>
                <a
                  href="https://polygonscan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Polygon Explorer
                </a>
              </li>
            </ul>
          </div>

          {/* Contact/Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Stay Connected
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                Polygon Network Live
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {currentYear} LUMILIGHT. All rights reserved.</p>
          <div className="flex items-center mt-4 md:mt-0 space-x-1">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
            <span>on Polygon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
