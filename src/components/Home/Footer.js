// src\components\Home\Footer.js

"use client";

import React from "react";
import Link from "next/link";
import {
  Github,
  Twitter,
  ExternalLink,
  Heart,
  Globe,
  ShieldCheck,
  Rocket,
  Zap,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/70 dark:bg-[#0a0a0b]/70 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 mt-20 relative overflow-hidden">
      {/* Decorative Glow for Dark Mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-lime-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-tr from-lime-500 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:rotate-12 transition-transform">
                <Rocket className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                LUMILIGHT
              </span>
            </Link>
            <p className="text-gray-500 dark:text-white/40 text-sm leading-relaxed font-medium">
              Empowering the next generation of creators through decentralized
              crowdfunding. Built for the community, secured by the blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">
              Platform
            </h3>
            <ul className="space-y-4">
              {["Explore Campaigns", "Create-Campaign", "Dashboard"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={
                        item === "Explore Campaigns"
                          ? "/"
                          : `/${item.toLowerCase()}`
                      }
                      className="text-gray-500 dark:text-white/40 hover:text-lime-600 dark:hover:text-lime-400 text-sm font-bold transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">
              Developer
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://github.com/Deependra-Bhatt/web3_CrowdfundingDApp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-gray-500 dark:text-white/40 hover:text-lime-600 dark:hover:text-lime-400 text-sm font-bold transition-colors"
                >
                  <Github className="w-4 h-4 mr-2" /> GitHub Source
                </a>
              </li>
              <li>
                <div className="flex items-center text-gray-500 dark:text-white/40 text-sm font-bold cursor-help">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Audited Contracts
                </div>
              </li>
              <li>
                <a
                  href="https://amoy.polygonscan.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-gray-500 dark:text-white/40 hover:text-lime-600 dark:hover:text-lime-400 text-sm font-bold transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> PolygonScan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact/Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">
              Community
            </h3>
            <div className="flex space-x-3">
              {[Twitter, Globe, Zap].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 dark:text-white/60 hover:text-lime-500 hover:border-lime-500/50 transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
              <span className="w-2 h-2 bg-lime-500 rounded-full mr-2 animate-pulse" />
              POLYGON AMOY LIVE
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/20">
          <p>&copy; {currentYear} LUMILIGHT . ALL RIGHTS RESERVED.</p>
          <div className="flex items-center mt-4 md:mt-0 gap-1">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-current" />
            <span>on Polygon Amoy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
