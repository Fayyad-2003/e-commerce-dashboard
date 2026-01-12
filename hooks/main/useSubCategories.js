"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useSubCategories(categoryId) {

  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });

  const [meta, setMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // read page & per_page from query string
  useEffect(() => {
    const p = Number(searchParams.get("page") ?? 1);
    const pp = Number(searchParams.get("per_page") ?? 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
  }, [searchParams]);

  const apiUrl = useMemo(() => {
    const qs = new URLSearchParams({
      category_id: String(categoryId ?? ""),
      page: String(page),
      per_page: String(perPage),
    });
    return `/api/sub-categories/by-category?${qs.toString()}`;
  }, [categoryId, page, perPage]);

  const reload = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const arr = Array.isArray(json?.data) ? json.data : [];
      // meta might be json.meta.pagination or json.meta
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setData(arr);
      setMeta(json?.meta)
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
  }, [apiUrl, categoryId, page, perPage]);

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
    // push to the sub-branch listing for this categoryId
    router.push(`/admin/branches/sub-branch/${categoryId}?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/branches/sub-branch/${categoryId}?${sp.toString()}`);
  };

  // ----- new: delete handler for sub-categories -----
  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد أنك تريد حذف هذا القسم الفرعي؟ لا يمكن التراجع.");
    if (!ok) return;
    try {
      const res = await fetchClient(`/api/sub-categories/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        alert(json?.message || `فشل الحذف (HTTP ${res.status})`);
        return;
      }
      alert(json?.message || "تم الحذف بنجاح");
      // إعادة تحميل القائمة الحالية
      await reload();
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
    }
  }

  return {
    data,
    pagination,
    loading,
    err,
    page,
    meta,
    perPage,
    reload,
    goToPage,
    changePerPage,
    handleDelete, // <-- exported
  };
}
