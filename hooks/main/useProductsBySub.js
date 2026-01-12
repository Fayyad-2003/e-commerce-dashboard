"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useProductsBySub() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const subId = useMemo(() => {
    let id = params?.id;
    if (Array.isArray(id)) id = id[0];
    return id ?? "";
  }, [params]);

  const mainCategoryId = search.get("mainCategoryId");

  const [page, setPage] = useState(() => Number(search?.get("page") ?? 1));
  const [perPage, setPerPage] = useState(() => Number(search?.get("per_page") ?? 10));

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null); // raw meta from API (kept for subcategory_name etc)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: perPage,
    current_page: page,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // sync page/perPage when URL search params change
  useEffect(() => {
    const p = Number(search?.get("page") ?? 1);
    const pp = Number(search?.get("per_page") ?? 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
  }, [search]);

  const apiUrl = useMemo(() => {
    if (!subId) return null;
    return `/api/products/sub/${subId}?page=${page}&per_page=${perPage}`;
  }, [subId, page, perPage]);

  const reload = useCallback(async () => {
    if (!apiUrl) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      const p = json?.meta ?? null;

      setData(items);
      setMeta(p);
      setPagination({
        total: Number(p?.total ?? items.length),
        per_page: Number(p?.per_page ?? perPage),
        current_page: Number(p?.current_page ?? page),
        last_page: Number(p?.last_page ?? 1),
      });
    } catch (e) {
      setErr(e?.message || "حدث خطأ أثناء الجلب");
      setData([]);
      setMeta(null);
      setPagination((prev) => ({ ...prev, total: 0, from: 0, to: 0 }));
    } finally {
      setLoading(false);
    }
  }, [apiUrl, page, perPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  // navigate to a page (preserve other query params)
  const goToPage = (n) => {
    if (!subId) return;
    const last = Math.max(1, Number(pagination.last_page ?? 1));
    const target = Math.max(1, Math.min(Number(n) || 1, last));
    const sp = new URLSearchParams(Array.from(search?.entries?.() ?? []));
    sp.set("page", String(target));
    sp.set("per_page", String(perPage));
    router.push(`/admin/products/sub-branch-products/${subId}?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    if (!subId) return;
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(Array.from(search?.entries?.() ?? []));
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/admin/products/sub-branch-products/${subId}?${sp.toString()}`);
  };

  // ----- new: delete handler for products -----
  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع.");
    if (!ok) return;
    try {
      const res = await fetchClient(`/api/products/${id}`, { method: "DELETE" });
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
    meta,
    pagination,
    loading,
    err,
    subId,
    reload,
    goToPage,
    changePerPage,
    handleDelete, // <-- exported
    mainCategoryId
  };
}
