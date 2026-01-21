"use client";
import { useRouter, useSearchParams } from "next/navigation";
import useFetchList from "../useFetchList";
import { fetchClient } from "../../src/lib/fetchClient";
import toast from "react-hot-toast";
import { useNotifications as useNotificationsContext } from "../../context/NotificationsContext";

export default function useNotifications() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: notifications,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setNotifications,
  } = useFetchList({
    url: "/api/notifications"
  });

  const { updateUnreadCount } = useNotificationsContext();

  const handleMarkRead = async (id) => {
    // 1. Optimistic Update
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    if (typeof updateUnreadCount === "function") updateUnreadCount(-1);

    try {
      const res = await fetchClient(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "فشل تحديث حالة الإشعار");
      }
      // No need to reload, optimistic update is sufficient
    } catch (e) {
      // 2. Rollback on failure
      setNotifications(originalNotifications);
      if (typeof updateUnreadCount === "function") updateUnreadCount(1);
      toast.error(e.message || "حدث خطأ أثناء تحديث الإشاع");
    }
  };

  return {
    notifications,
    pagination,
    loading,
    err,
    reload,
    goToPage,
    changePerPage,
    handleMarkRead,
  };
}
