"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

export default function useOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Status Filter Logic
  const initialStatus = (searchParams.get("status") ?? "all").toLowerCase();
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  useEffect(() => {
    const s = (searchParams.get("status") ?? "all").toLowerCase();
    setSelectedStatus(s);
  }, [searchParams]); // Simplified dep

  // 2. Use FetchList
  const {
    data: rawOrders,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setRawOrders
  } = useFetchList({
    url: (page, perPage) => {
      const u = new URLSearchParams();
      u.set("page", String(page));
      u.set("per_page", String(perPage));
      if (selectedStatus && selectedStatus !== "all") {
        u.set("status", selectedStatus);
      }
      return `/api/orders?${u.toString()}`;
    },
    dependencies: [selectedStatus]
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  // 3. Mapping Logic (keep strictly consistent with previous implementation)
  const orders = useMemo(() => {
    return rawOrders.map((o) => ({
      id: Number(o.id),
      orderNumber: String(o.id),
      date: o.created_at || "—",
      status: String((o.status || "pending")).toLowerCase(),
      total: Number(o.final_total ?? o.subtotal ?? 0),
      user: o.user ?? null,
      arr: Array.isArray(o.arr) ? o.arr : [], // Legacy compat
      raw: o,
      is_archived: o.is_archived // Ensure archived status is passed
    }));
  }, [rawOrders]);


  // 4. Status Change Handler
  const changeStatus = (newStatus) => {
    const normalized = (String(newStatus || "all")).toLowerCase();
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(pagination.per_page));
    if (!normalized || normalized === "all") {
      sp.delete("status");
    } else {
      sp.set("status", normalized);
    }
    router.push(`/admin/orders?${sp.toString()}`);
    setSelectedStatus(normalized);
  };

  // 5. Handlers (Complete, Delete, Archive, etc)
  async function loadSingle(id) {
    try {
      const res = await fetchClient(`/api/orders/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      const o = json?.data ?? {};
      setSelectedOrder({
        id: Number(o.id),
        orderNumber: String(o.id),
        date: o.created_at || "—",
        status: String((o.status || "pending")).toLowerCase(),
        total: Number(o.final_total ?? o.subtotal ?? 0),
        user: o.user ?? null,
        items: Array.isArray(o.items) ? o.items : [],
        raw: o,
        is_archived: o.is_archived
      });
    } catch { }
  }

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    if (!order.items?.length) await loadSingle(order.id);
  };

  const handleComplete = async (orderId) => {
    if (!confirm("تأكيد: هل تريد وسم هذه الطلبية بأنها مكتملة؟")) return;

    // Snapshot
    const previousOrders = [...rawOrders];

    // Optimistic Update
    // If we are filtering by a specific status (e.g. 'processing'), completing it should remove it from view.
    // If status is 'all', it just updates the status label.
    setRawOrders((os) => {
      if (selectedStatus && selectedStatus !== 'all') {
        return os.filter(o => o.id !== orderId);
      }
      return os.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o));
    });

    // Also update selected order if it's the one
    setSelectedOrder((o) =>
      o && o.id === orderId ? { ...o, status: "completed" } : o
    );

    try {
      const res = await fetchClient(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل تحديث الحالة");
      toast.success("تم تحديث حالة الطلبية بنجاح");
      // No reload() needed if successful
    } catch (e) {
      toast.error(e?.message || "فشل تحديث الحالة");
      setRawOrders(previousOrders); // Revert
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm("تأكيد: هل تريد حذف هذه الطلبية نهائياً؟")) return;

    // Snapshot
    const previousOrders = [...rawOrders];

    // optimistic
    setRawOrders((os) => os.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }

    try {
      const res = await fetchClient(`/api/orders/${orderId}/delete`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل حذف الطلبية");
      toast.success("تم حذف الطلبية بنجاح");
      // No reload() needed
    } catch (e) {
      toast.error(e?.message || "فشل حذف الطلبية");
      setRawOrders(previousOrders); // Revert
    }
  };

  const handleToggleArchive = async (orderId) => {
    if (!confirm("هل تريد تغيير حالة الأرشفة لهذه الطلبية؟")) return;

    // Snapshot
    const previousOrders = [...rawOrders];

    // Optimistic Update
    // Usually archiving removes it from the main list, or unarchiving removes it from the archive list.
    // So we filter it out to simulate "moving" to the other list.
    setRawOrders((os) => os.filter((o) => o.id !== orderId));

    try {
      const res = await fetchClient(`/api/orders/${orderId}/toggle-archive`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل تغيير حالة الأرشفة");
      toast.success("تم تغيير حالة الأرشفة بنجاح");
      // No reload() needed
    } catch (e) {
      toast.error(e?.message || "فشل تغيير حالة الأرشفة");
      setRawOrders(previousOrders); // Revert
    }
  };

  return {
    orders, // Mapped data
    pagination,
    loading,
    err,
    selectedOrder,
    goToPage,
    changePerPage,
    handleComplete,
    handleDelete,
    handleToggleArchive,
    handleSelectOrder,
    setSelectedOrder,
    selectedStatus,
    changeStatus,
  };
}
