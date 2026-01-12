"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useEditDiscount() {
  const router = useRouter();
  const params = useParams();
  const discountId = params?.id;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  /** ✅ Fetch discount */
  useEffect(() => {
    if (!discountId) return;

    (async () => {
      setLoading(true);
      setErrors({});

      try {
        const res = await fetchClient(`/api/discounts/${discountId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "فشل جلب البيانات");

        const discount = data?.data ?? data;

        setInitialData({
          name: discount?.name ?? "",
          type: discount?.type ?? "order_total",
          value: discount?.value ?? "",
          value_type: discount?.value_type ?? "fixed",
          min_order_total: discount?.min_order_total ?? "",
        });
      } catch (err) {
        setErrors({ form: err.message || "فشل جلب البيانات" });
      } finally {
        setLoading(false);
      }
    })();
  }, [discountId]);

  /** ✅ Submit */
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});

    try {
      const form = new FormData();
      for (const key of ["name", "type", "value", "value_type", "min_order_total"]) {
        form.append(key, formData[key] ?? "");
      }

      const res = await fetchClient(`/api/discounts/${discountId}`, {
        method: "POST",
        body: form,
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok || out?.success === false) {
        // Check for validation errors
        if (out?.errors && typeof out.errors === 'object') {
          setErrors(out.errors);
        } else {
          setErrors({ form: out?.message || "لم يتم الحفظ" });
        }
        return;
      }

      router.push("/admin/discounts");
    } catch (err) {
      setErrors({ form: err.message || "فشل الحفظ" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    initialData,
    loading,
    submitting,
    errors,
    handleSubmit,
    goBack: () => router.back(),
  };
}
