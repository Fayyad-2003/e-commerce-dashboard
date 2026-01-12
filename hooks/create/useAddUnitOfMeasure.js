"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useAddUnitOfMeasure() {
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", label.trim());

      const res = await fetchClient("/api/units-of-measure", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      router.push("/admin/sizetable");
    } catch (err) {
      console.error("Error adding size:", err);
      setError(err.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    label,
    setLabel,
    isSubmitting,
    error,
    handleSubmit,
    cancel: () => router.push("/admin/sizetable"),
  };
}
