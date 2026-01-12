"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

export default function useBranches() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: branches,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
  } = useFetchList({
    url: "/api/categories" // Keeps original endpoint
  });

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
      reload();
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
    }
  }

  // Preserve original return structure including page/perPage wrappers if needed
  // But useFetchList handles them internally. 
  // original returned: page, perPage. We can extract them from searchParams or pagination.current_page
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("per_page") ?? 10);

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
