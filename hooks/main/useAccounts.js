"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchClient } from "../../src/lib/fetchClient";

/**
 * named export so your existing imports like:
 * import { useAccounts } from ".../hooks"
 * keep working.
 */
export default function useAccounts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // read query string
  useEffect(() => {
    const p = Number(searchParams.get("page") ?? 1);
    const pp = Number(searchParams.get("per_page") ?? 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
  }, [searchParams]);

  const apiUrl = useMemo(() => {
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    return `/api/customers?${qs.toString()}`;
  }, [page, perPage]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setAccounts(arr);
      setPagination({
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? perPage),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
      });
    } catch (e) {
      setError(e?.message || "تعذّر الجلب");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, perPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const last = Math.max(1, Number(pagination.last_page ?? 1));
    const target = Math.max(1, Math.min(nn, last));
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(target));
    sp.set("per_page", String(perPage));
    router.push(`/admin/accounts?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/accounts?${sp.toString()}`);
  };

  const handleDelete = async (customer) => {
    const id = customer?.id;
    if (!id) return;
    if (!confirm(`هل تريد حذف المستخدم: ${customer.name}?`)) return;

    try {
      const res = await fetchClient(`/api/customers/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        alert(json?.message || `فشل الحذف (HTTP ${res.status})`);
        return;
      }
      alert("✅ تم حذف المستخدم");
      // reload current page
      await reload();
    } catch (e) {
      alert(e?.message || "خطأ أثناء حذف الحساب");
    }
  };

  return {
    accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
