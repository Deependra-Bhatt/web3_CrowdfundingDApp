// src\components\ThemeToggle.js
"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";

// This component renders a button to toggle between light and dark themes.

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:ring-2 hover:ring-lime-500 transition-all duration-300 focus:outline-none"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
