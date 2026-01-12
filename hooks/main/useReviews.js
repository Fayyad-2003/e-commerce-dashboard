"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useReviews() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const p = Number(searchParams.get("page") ?? 1);
    const pp = Number(searchParams.get("per_page") ?? 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
  }, [searchParams]);

  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiUrl = useMemo(() => {
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    return `/api/reviews?${qs.toString()}`;
  }, [page, perPage]);

  async function reload() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setComments(arr);
      setPagination({
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? perPage),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
      });
    } catch (e) {
      setErr(e?.message || "تعذّر الجلب");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const goToPage = (n) => {
    const nn = Number(n) || 1;
    // clamp using current pagination.last_page (fallback to 1)
    const last = Math.max(1, Number(pagination.last_page ?? 1));
    const target = Math.max(1, Math.min(nn, last));
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(target));
    sp.set("per_page", String(perPage));
    router.push(`/admin/reviews?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1"); // reset to first page
    sp.set("per_page", String(per));
    router.push(`/admin/reviews?${sp.toString()}`);
  };

  const handleApprove = async (id) => {
    const realId = typeof id === "object" ? id.id ?? id : id;
    try {
      const res = await fetchClient(`/api/reviews/${realId}/approve`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل الموافقة على التعليق");
      setComments((cs) =>
        cs.map((c) => (c.id === realId ? { ...c, status: "approved" } : c))
      );
      reload();
    } catch (e) {
      alert(e.message || e);
    }
  };

  const handleReject = async (id) => {
    const realId = typeof id === "object" ? id.id ?? id : id;
    try {
      const res = await fetchClient(`/api/reviews/${realId}/delete`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل رفض/حذف التعليق");
      setComments((cs) => cs.filter((c) => c.id !== realId));
      reload();
    } catch (e) {
      alert(e.message || e);
    }
  };

  const dynamicBackHref = searchParams.get("backUrl") || "/";

  return {
    page,
    perPage,
    comments,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleApprove,
    handleReject,
    dynamicBackHref,
  };
}
