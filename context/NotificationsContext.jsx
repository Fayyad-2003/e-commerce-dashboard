"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { fetchClient } from "../src/lib/fetchClient";

const NotificationsContext = createContext();

export default function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // stable function reference
  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetchClient("/api/notifications/unread-count", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.success) {
        setUnreadCount(Number(data?.data?.count ?? 0));
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []); // no deps => stable

  // optimistic adjustment helper (keeps non-negative)
  const updateUnreadCount = useCallback((amount = -1) => {
    setUnreadCount((prev) => Math.max(prev + amount, 0));
  }, []);

  // load once on mount (fetchUnread is stable so OK to include in deps)
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  // memoize provider value so consumers only re-render when necessary
  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      updateUnreadCount,
      reloadUnreadCount: fetchUnread,
    }),
    [unreadCount, updateUnreadCount, fetchUnread]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
