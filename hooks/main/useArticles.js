"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

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
  } = useFetchList({
    url: "/api/articles"
  });

  async function handleDelete(articleId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المقال؟")) return;

    try {
      const res = await fetchClient(`/api/articles/${articleId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر حذف المقال");
        return;
      }

      alert(json.message || "تم حذف المقال بنجاح");
      reload();
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
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
