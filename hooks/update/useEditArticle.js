"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useEditArticle() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.articleId;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** ✅ Fetch article */
  useEffect(() => {
    if (!articleId) return;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetchClient(`/api/articles/${articleId}`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "فشل الجلب");

        const article = data?.data ?? data?.article ?? data;

        setInitialData({
          title: article?.title ?? "",
          date: article?.date ?? "",
          content: article?.content ?? "",
          image: article?.image_url ?? article?.image ?? null,
        });
      } catch (err) {
        setError(err.message || "فشل الجلب");
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  /** ✅ Submit */
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("date", formData.date || "");
      form.append("content", formData.content);

      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      const res = await fetchClient(`/api/articles/${articleId}`, {
        method: "POST",
        body: form,
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || "لم يتم الحفظ");
      }

      // ✅ success
      router.push("/admin/articles");
    } catch (err) {
      setError(err.message || "فشل الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    initialData,
    loading,
    submitting,
    error,
    handleSubmit,
    goBack: () => router.back(),
  };
}
