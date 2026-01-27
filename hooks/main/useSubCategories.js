"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";
import { showConfirm } from "../../src/lib/confirm";

export default function useSubCategories(categoryId, options = {}) {
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
    basePath: `/admin/branches/sub-branch/${categoryId}`,
    defaultPerPage: options.perPage || 10,
  });

  // ----- new: delete handler for sub-categories -----
  async function handleDelete(id) {
    if (!id) return;

    const ok = await showConfirm({
      title: "حذف القسم الفرعي",
      text: "هل أنت متأكد أنك تريد حذف هذا القسم الفرعي؟ لا يمكن التراجع.",
      confirmButtonText: "حذف",
      icon: "warning"
    });
    if (!ok) return;

    // Snapshot
    const previous = [...data];

    // Optimistic
    setSubCategories(current => current.filter(item => item.id !== id));

    try {
      const res = await fetchClient(`/api/sub-categories/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `فشل الحذف (HTTP ${res.status})`);
      }
      toast.success(json?.message || "تم الحذف بنجاح ✅");
      // No reload() needed
    } catch (e) {
      toast.error(`خطأ: ${e?.message || e}`);
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
