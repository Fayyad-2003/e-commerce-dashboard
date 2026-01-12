"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchClient } from "../../src/lib/fetchClient";

export default function useDiscounts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const per_page = Number(searchParams.get("per_page") ?? 10);

  const [discounts, setDiscounts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page,
    current_page: page,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiUrl = useMemo(() => {
    const u = new URL("/api/discounts", window.location.origin);
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  }, [page, per_page]);

  async function reload() {
    setLoading(true);
    setErr("");
    try {

      const res = await fetchClient(apiUrl, { cache: "no-store" });

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setDiscounts(arr);
      setPagination({
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? per_page),
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

  /** ✅ Page change handler */
  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(nn));
    sp.set("per_page", String(per_page));
    router.push(`/admin/discounts?${sp.toString()}`);
  };

  /** ✅ Change per-page handler (reset to page 1) */
  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/discounts?${sp.toString()}`);
  };

  async function handleDelete(discountId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الخصم؟")) return;

    try {
      const res = await fetchClient(`/api/discounts/${discountId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر حذف الخصم");
        return;
      }

      alert(json.message || "تم حذف الخصم بنجاح");
      // بعد الحذف، أعد تحميل الصفحة الحالية
      const sp = new URLSearchParams(searchParams.toString());
      reload();
      router.push(`/admin/discounts?${sp.toString()}`);
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
    }
  }

  return {
    discounts,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
