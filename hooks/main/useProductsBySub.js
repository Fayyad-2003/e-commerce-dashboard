"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

export default function useProductsBySub() {
  const params = useParams();
  const search = useSearchParams();

  const subId = useMemo(() => {
    let id = params?.id;
    if (Array.isArray(id)) id = id[0];
    return id ?? "";
  }, [params]);

  const mainCategoryId = search.get("mainCategoryId");

  const {
    data,
    meta,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
  } = useFetchList({
    url: (page, perPage) => {
      if (!subId) return null;
      return `/api/products/sub/${subId}?page=${page}&per_page=${perPage}`;
    },
    dependencies: [subId],
    basePath: `/admin/products/sub-branch-products/${subId}` // Dynamic base path
  });


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
    handleDelete,
    mainCategoryId
  };
}
