// src\components\ThemeContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initial = savedTheme ?? (prefersDark ? "dark" : "light");

      setTheme(initial);

      if (initial === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");

      console.log("theme init:", {
        savedTheme,
        prefersDark,
        initial,
        htmlClass: document.documentElement.className,
      });
    } catch (err) {
      console.error("ThemeProvider init error:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");

      console.log("theme changed:", {
        theme,
        htmlClass: document.documentElement.className,
      });
    } catch (err) {
      console.error("ThemeProvider change error:", err);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
