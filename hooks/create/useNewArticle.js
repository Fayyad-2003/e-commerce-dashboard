"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import toast from "react-hot-toast";

export function useNewArticle() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async ({ title, content, image }) => {
    if (!title?.trim() || !content?.trim()) {
      setError("العنوان والمحتوى مطلوبان");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content.trim());
      if (image instanceof File) {
        fd.append("image", image);
      }

      const res = await fetchClient("/api/articles", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || `HTTP ${res.status}`);
      }

      toast.success("تم اضافة المقال بنجاح");
      router.push("/admin/articles");
    } catch (err) {
      console.error(err);
      setError(err.message || "فشل إنشاء المقال");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    handleSubmit,
    goBack: () => router.push("/articles"),
  };
}
