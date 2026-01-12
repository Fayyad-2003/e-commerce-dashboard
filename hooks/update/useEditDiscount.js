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
  const [error, setError] = useState("");

  /** ✅ Fetch discount */
  useEffect(() => {
    if (!discountId) return;

    (async () => {
      setLoading(true);
      setError("");

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
        setError(err.message || "فشل جلب البيانات");
      } finally {
        setLoading(false);
      }
    })();
  }, [discountId]);

  /** ✅ Submit */
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError("");

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
        throw new Error(out?.message || "لم يتم الحفظ");
      }

      router.push("/admin/discounts");
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
