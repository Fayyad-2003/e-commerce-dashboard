"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useUnitsOfMeasure() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // read page & per_page directly from URL (like useBundles)
  const page = Number(searchParams.get("page") ?? 1);
  const per_page = Number(searchParams.get("per_page") ?? 10);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page,
    current_page: page,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiUrl = useMemo(() => {
    const u = new URL("/api/units-of-measure", window.location.origin);
    u.searchParams.set("page", String(page));
    u.searchParams.set("per_page", String(per_page));
    return u.toString();
  }, [page, per_page]);

  /** ✅ Fetch units list (same pattern as useBundles.fetchOffers) */
  const reload = async () => {
    setErr("");
    setLoading(true);

    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const arr = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setData(arr);
      setPagination({
        total: Number(p.total ?? arr.length),
        per_page: Number(p.per_page ?? per_page),
        current_page: Number(p.current_page ?? page),
        last_page: Number(p.last_page ?? 1),
        from: Number(p.from ?? (arr.length ? 1 : 0)),
        to: Number(p.to ?? arr.length),
      });
    } catch (e) {
      setErr(e?.message || "حدث خطأ أثناء الجلب");
    } finally {
      setLoading(false);
    }
  };

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
    router.push(`/admin/sizetable?${sp.toString()}`);
  };

  /** ✅ Change per-page handler (reset to page 1) */
  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/sizetable?${sp.toString()}`);
  };

  const handleCreateUnit = async (name) => {
    try {
      const formData = new FormData();
      formData.append("name", name);

      const res = await fetchClient("/api/units-of-measure/store", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر إنشاء الوحدة");
        return false;
      }

      alert("✅ تم إنشاء وحدة القياس بنجاح");
      // reload to reflect server-side pagination state
      await reload();
      return true;
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
      return false;
    }
  };

  const handleDelete = async (unitId) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف وحدة القياس هذه؟")) return;

    try {
      const res = await fetchClient(`/api/units-of-measure/${unitId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر حذف وحدة القياس");
        return;
      }

      alert("✅ تم حذف وحدة القياس");
      // refresh list
      await reload();
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
    }
  };

  return {
    data,
    pagination,
    loading,
    err,
    handleCreateUnit,
    handleDelete,
    reload,
    goToPage,
    changePerPage,
  };
}
