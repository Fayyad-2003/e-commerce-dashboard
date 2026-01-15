"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

export default function useArticles() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: articles,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setArticles
  } = useFetchList({
    url: "/api/articles"
  });

  async function handleDelete(articleId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المقال؟")) return;

    // Snapshot
    const previous = [...articles];

    // Optimistic
    setArticles(current => current.filter(a => a.id !== articleId));

    try {
      const res = await fetchClient(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "تعذّر حذف المقال");
      }

      toast.success(json.message || "تم حذف المقال بنجاح ✅");
      // No reload() needed
    } catch (err) {
      toast.error(`خطأ: ${err?.message || err}`);
      setArticles(previous); // Revert
    }
  }

  return {
    articles,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
