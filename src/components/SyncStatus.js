import React, { useState, useEffect } from "react";
import { onSyncStatusChange, checkOnlineStatus } from "../utils/database";

function SyncStatus() {
  const [status, setStatus] = useState("syncing");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen to sync status changes
    const unsubscribe = onSyncStatusChange((newStatus) => {
      setStatus(newStatus);
      // If status is syncing or synced, we're online
      if (newStatus === "syncing" || newStatus === "synced") {
        setIsOnline(true);
      } else if (newStatus === "offline") {
        setIsOnline(false);
      }
    });

    // Listen to online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Status will update via sync status callback
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check - wait a bit for database to initialize
    setTimeout(() => {
      setIsOnline(navigator.onLine && checkOnlineStatus());
    }, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        text: "Offline - Data saved locally",
        color: "#f59e0b",
        icon: "📡"
      };
    }

    switch (status) {
      case "syncing":
        return {
          text: "Syncing to server...",
          color: "#3b82f6",
          icon: "🔄"
        };
      case "synced":
        return {
          text: "Synced with server",
          color: "#10b981",
          icon: "✅"
        };
      case "paused":
        return {
          text: "Sync paused",
          color: "#f59e0b",
          icon: "⏸️"
        };
      case "error":
        return {
          text: "Sync error",
          color: "#ef4444",
          icon: "❌"
        };
      case "offline":
        return {
          text: "Offline - Data saved locally",
          color: "#f59e0b",
          icon: "📡"
        };
      default:
        return {
          text: "Connecting...",
          color: "#6b7280",
          icon: "⏳"
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#ffffff",
        padding: "8px 16px",
        borderRadius: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        border: `2px solid ${statusInfo.color}`,
        fontSize: "0.875rem",
        fontWeight: "500",
        color: statusInfo.color,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span>{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
    </div>
  );
}

export default SyncStatus;
