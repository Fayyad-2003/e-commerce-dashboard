// useOrders.js
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // read from search params (fallbacks)
  const page = Number(searchParams.get("page") ?? 1);
  const per_page = Number(searchParams.get("per_page") ?? 10);
  // normalize status to lowercase, default "all"
  const initialStatus = (searchParams.get("status") ?? "all").toLowerCase();

  // keep selectedStatus in state so UI always reflects it immediately
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);

  // ensure state follows URL changes (keeps in sync when router pushes)
  useEffect(() => {
    const s = (searchParams.get("status") ?? "all").toLowerCase();
    setSelectedStatus(s);
    // NOTE: intentionally not adding setSelectedStatus to deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const [pagination, setPagination] = useState({
    total: 0,
    per_page,
    current_page: page,
    last_page: 1,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const apiUrl = useMemo(() => {
    const u = new URL(
      "/api/orders",
      typeof window !== "undefined"
        ? window.location.origin
        : process?.env?.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    );
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    // include status only when not "all"
    if (selectedStatus && selectedStatus !== "all") {
      u.searchParams.set("status", selectedStatus);
    }
    return u.toString();
  }, [page, per_page, selectedStatus]);

  const loadList = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json().catch(() => ({}));
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setOrders(
        arr.map((o) => ({
          id: Number(o.id),
          orderNumber: String(o.id),
          date: o.created_at || "—",
          status: String((o.status || "pending")).toLowerCase(),
          total: Number(o.final_total ?? o.subtotal ?? 0),
          user: o.user ?? null,
          arr: Array.isArray(o.arr) ? o.arr : [],
          raw: o,
        }))
      );

      setPagination((prev) => ({
        ...prev,
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? per_page),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
      }));
    } catch (e) {
      setErr(e?.message || "تعذّر جلب الطلبيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nn));
    sp.set("per_page", String(per_page));
    router.push(`/admin/orders?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/orders?${sp.toString()}`);
  };

  // update URL and local state. resets to page 1.
  const changeStatus = (newStatus) => {
    const normalized = (String(newStatus || "all")).toLowerCase();
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per_page));
    if (!normalized || normalized === "all") {
      sp.delete("status");
    } else {
      sp.set("status", normalized);
    }
    // update URL (push so browser history keeps entries). You can use replace() if preferred.
    router.push(`/admin/orders?${sp.toString()}`);
    // also update local state immediately so UI reflects selection without waiting for route to finish.
    setSelectedStatus(normalized);
  };

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
      });
    } catch { }
  }

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    if (!order.items?.length) await loadSingle(order.id);
  };

  const handleComplete = async (orderId) => {
    if (!confirm("تأكيد: هل تريد وسم هذه الطلبية بأنها مكتملة؟")) return;

    // optimistic
    setOrders((os) =>
      os.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
    );
    setSelectedOrder((o) =>
      o && o.id === orderId ? { ...o, status: "completed" } : o
    );

    try {
      const res = await fetchClient(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل تحديث الحالة");
    } catch (e) {
      alert(e?.message || "فشل تحديث الحالة");

      // revert
      setOrders((os) =>
        os.map((o) => (o.id === orderId ? { ...o, status: "pending" } : o))
      );
      setSelectedOrder((o) =>
        o && o.id === orderId ? { ...o, status: "pending" } : o
      );
    }
  };

  return {
    orders,
    pagination,
    loading,
    err,
    selectedOrder,
    goToPage,
    handleComplete,
    handleSelectOrder,
    setSelectedOrder,
    changePerPage,
    // new API
    selectedStatus,
    changeStatus,
  };
}
