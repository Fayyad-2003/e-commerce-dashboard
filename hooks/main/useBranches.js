"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

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
    setData: setBranches
  } = useFetchList({
    url: "/api/categories" // Keeps original endpoint
  });

  async function handleDelete(id) {
    if (!id) return;
    const ok = window.confirm("هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع.");
    if (!ok) return;

    // Snapshot
    const previous = [...branches];

    // Optimistic
    setBranches(current => current.filter(b => b.id !== id));

    try {
      const res = await fetchClient(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `فشل الحذف (HTTP ${res.status})`);
      }
      toast.success(json?.message || "تم الحذف بنجاح ✅");
      // No reload() needed
    } catch (e) {
      toast.error(`خطأ: ${e?.message || e}`);
      setBranches(previous); // Revert
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
