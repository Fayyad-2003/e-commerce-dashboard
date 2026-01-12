"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useCreateNewDiscount() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** ✅ Submit new discount */
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      for (const key of ["name", "type", "value", "value_type", "min_order_total"]) {
        form.append(key, formData[key] ?? "");
      }

      const res = await fetchClient("/api/discounts", {
        method: "POST",
        body: form,
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || "فشل إنشاء الخصم");
      }

      router.push("/admin/discounts");
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء إنشاء الخصم");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    handleSubmit,
    goBack: () => router.back(),
  };
}
