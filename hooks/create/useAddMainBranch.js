"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useAddMainBranch() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit({ name, image }) {
    const value = name?.trim();
    if (!value) {
      alert("اسم القسم مطلوب");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", value);
      if (image) fd.append("image", image);

      const res = await fetchClient("/api/categories", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || `HTTP ${res.status}`);
      }

      alert("تم إنشاء القسم بنجاح!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "حدث خطأ أثناء إنشاء القسم");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    handleSubmit,
    onCancel: () => router.back(),
  };
}
