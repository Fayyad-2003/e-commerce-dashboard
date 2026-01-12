"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useNotifications() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const per_page = Number(searchParams.get("per_page") ?? 10);

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page,
    current_page: page,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiUrl = useMemo(() => {
    const u = new URL("/api/notifications", window.location.origin);
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  }, [page, per_page]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      console.log(json);
      console.log(p);

      setNotifications(arr);
      setPagination({
        total: Number(p.total),
        per_page: Number(p.per_page ?? per_page),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
      });
    } catch (e) {
      setErr(e?.message || "تعذّر الجلب");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, per_page]);

  useEffect(() => {
    reload();
  }, [reload]);

  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const last = Math.max(1, Number(pagination.last_page ?? 1));
    const target = Math.max(1, Math.min(nn, last));

    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(target));
    sp.set("per_page", String(per_page));
    router.push(`/admin/notifications?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/notifications?${sp.toString()}`);
  };

  return {
    notifications,
    pagination,
    loading,
    err,
    reload,
    goToPage,
    changePerPage,
  };
}
