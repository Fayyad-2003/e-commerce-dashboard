"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

export default function useSubCategories(categoryId) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data,
    pagination,
    meta,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setSubCategories
  } = useFetchList({
    url: (page, perPage) => {
      if (!categoryId) return null;
      return `/api/sub-categories/by-category?category_id=${categoryId}&page=${page}&per_page=${perPage}`;
    },
    dependencies: [categoryId],
    basePath: `/admin/branches/sub-branch/${categoryId}`
  });

  // ----- new: delete handler for sub-categories -----
  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد أنك تريد حذف هذا القسم الفرعي؟ لا يمكن التراجع.");
    if (!ok) return;

    // Snapshot
    const previous = [...data];

    // Optimistic
    setSubCategories(current => current.filter(item => item.id !== id));

    try {
      const res = await fetchClient(`/api/sub-categories/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        alert(json?.message || `فشل الحذف (HTTP ${res.status})`);
        setSubCategories(previous); // Revert
        return;
      }
      alert(json?.message || "تم الحذف بنجاح");
      // No reload() needed
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
      setSubCategories(previous); // Revert
    }
  }

  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("per_page") ?? 10);

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
    handleDelete,
  };
}
