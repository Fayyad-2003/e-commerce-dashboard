// useEditUnit.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useEditUnit() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      // create page
      setLoading(false);
      setInitialData(null);
      setError("");
      return;
    }

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchClient(`/api/units-of-measure/${id}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "فشل الجلب");
        const unit = data?.data ?? data?.unit ?? data;
        setInitialData({
          name: unit?.name ?? "",
          abbreviation: unit?.abbreviation ?? "",
        });
      } catch (err) {
        setError(err?.message || String(err) || "فشل الجلب");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      // تأكّد تحمل نفس أسماء الحقول اللي الـ API بانتظرها
      if (formData.name != null) form.append("name", formData.name);
      if (formData.abbreviation != null) form.append("abbreviation", formData.abbreviation);

      // لو في id -> تحديث، وإلا -> إنشاء
      const isUpdate = Boolean(id);
      const url = isUpdate ? `/api/units-of-measure/${id}` : `/api/units-of-measure`;

      const res = await fetchClient(url, {
        method: 'POST',
        body: form,
      });

      const out = await res.json().catch(() => ({}));

      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || `HTTP ${res.status}`);
      }

      router.push("/admin/sizetable");
    } catch (err) {
      setError(err?.message || String(err) || "فشل الحفظ");
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
