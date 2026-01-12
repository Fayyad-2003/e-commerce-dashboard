"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useCreateNewDiscount() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /** ✅ Submit new discount */
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});

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
        // Check for validation errors
        if (out?.errors && typeof out.errors === 'object') {
          setErrors(out.errors);
        } else {
          setErrors({ form: out?.message || "فشل إنشاء الخصم" });
        }
        return;
      }

      router.push("/admin/discounts");
    } catch (err) {
      setErrors({ form: err.message || "حدث خطأ أثناء إنشاء الخصم" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    errors,
    handleSubmit,
    goBack: () => router.back(),
  };
}
