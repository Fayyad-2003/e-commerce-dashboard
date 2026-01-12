"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchClient } from "../../src/lib/fetchClient";

export default function useBranches() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // قراءـة query من الـ URL
  useEffect(() => {
    const p = Number(searchParams.get("page") ?? 1);
    const pp = Number(searchParams.get("per_page") ?? 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
  }, [searchParams]);

  const apiUrl = useMemo(() => {
    const qs = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    return `/api/categories?${qs.toString()}`;
  }, [page, perPage]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchClient(apiUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const arr = Array.isArray(json?.data) ? json.data : [];
      // بعض الـ APIs تضع pagination داخل meta.pagination أو meta مباشرة — ندعم الحالتين
      const p = json?.meta?.pagination ?? json?.meta ?? {};

      setBranches(arr);
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
    // اضبط المسار للصفحة حيث تعرض الأقسام — عدّل المسار لو مكان صفحتك مختلف
    router.push(`/?${sp.toString()}`);
  };

  const changePerPage = (newPer) => {
    const per = Number(newPer) || 10;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    router.push(`/?${sp.toString()}`);
  };

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع.");
    if (!ok) return;
    try {
      const res = await fetchClient(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        alert(json?.message || `فشل الحذف (HTTP ${res.status})`);
        return;
      }
      alert(json?.message || "تم الحذف بنجاح");
      // بعد الحذف نعيد تحميل الصفحة الحالية (قد تأتي صفحتك فارغة عند حذف العنصر الأخير في الصفحة)
      await reload();
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
    }
  }

  return {
    branches,
    pagination,
    loading,
    err,
    page,
    perPage,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
