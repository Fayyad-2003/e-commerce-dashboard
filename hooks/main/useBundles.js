"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchClient } from "../../src/lib/fetchClient";

export default function useBundles() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const per_page = Number(searchParams.get("per_page") ?? 10);

  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page,
    current_page: page,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiUrl = useMemo(() => {
    const u = new URL("/api/offers", window.location.origin);
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  }, [page, per_page]);

  /** ✅ Fetch offers list */
  const fetchOffers = async () => {
    setErr("");
    setLoading(true);
    try {

      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setOffers(arr);
      setPagination({
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? per_page),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
      });
    } catch (e) {
      setErr(e?.message || "حدث خطأ أثناء الجلب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  /** ✅ Page change handler */
  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nn));
    sp.set("per_page", String(per_page));
    router.push(`/admin/bundles?${sp.toString()}`);
  };

  /** ✅ Change per-page handler (reset to page 1) */
  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/bundles?${sp.toString()}`);
  };

  /** ✅ Delete handler */
  const handleDelete = async (offer) => {
    if (!confirm(`هل أنت متأكد من حذف العرض "${offer.name}"؟`)) return;

    try {
      const res = await fetchClient(`/api/offers/${offer.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "فشل حذف العرض");
      }

      alert("تم حذف العرض بنجاح ✅");
      await fetchOffers(); // Refresh list
    } catch (e) {
      alert(`❌ خطأ أثناء الحذف: ${e.message}`);
    }
  };

  return {
    offers,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
  };
}
