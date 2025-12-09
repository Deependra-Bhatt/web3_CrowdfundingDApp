// src\components\NotificationContext.js
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    message: null,
    type: "info", 
    isVisible: false,
  });

  const showNotification = useCallback(
    (message, type = "info", duration = 3000) => {
      setNotification({
        message,
        type,
        isVisible: true,
      });

      // Auto-hide after duration
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
      }, duration);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationModal notification={notification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

// -----------------------------------------------------------------------------
// 2. Notification Modal Component (Internal)
// -----------------------------------------------------------------------------

import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const NotificationModal = ({ notification }) => {
  const { message, type, isVisible } = notification;

  if (!isVisible || !message) return null;

  let icon, bgColor, textColor, iconColor;

  switch (type) {
    case "success":
      icon = <CheckCircle />;
      bgColor = "bg-green-500";
      textColor = "text-white";
      iconColor = "text-white";
      break;
    case "error":
      icon = <XCircle />;
      bgColor = "bg-red-500";
      textColor = "text-white";
      iconColor = "text-white";
      break;
    case "warning":
      icon = <AlertTriangle />;
      bgColor = "bg-yellow-500";
      textColor = "text-gray-900";
      iconColor = "text-gray-900";
      break;
    case "info":
    default:
      icon = <Info />;
      bgColor = "bg-blue-500";
      textColor = "text-white";
      iconColor = "text-white";
      break;
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-transform duration-500 ${
        isVisible ? "translate-y-0" : "translate-y-20"
      }`}
    >
      <div className={`flex items-center p-4 rounded-lg shadow-2xl ${bgColor}`}>
        <div className={`mr-3 ${iconColor}`}>{icon}</div>
        <div className={`font-medium text-sm ${textColor}`}>{message}</div>
      </div>
    </div>
  );
};
