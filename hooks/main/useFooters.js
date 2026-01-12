// useFooters.js
"use client";
import { useState, useEffect } from "react";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useFooters() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // string | null
  const [successMessage, setSuccessMessage] = useState(null); // string | null

  useEffect(() => {
    async function fetchFooter() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchClient("/api/footer");
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`خطأ في الاستجابة: ${res.status} ${text}`);
        }
        const data = await res.json();
        setFooterData(data?.data || {});
      } catch (err) {
        console.error("Footer fetch error:", err);
        setError(
          err?.message || "حدث خطأ أثناء تحميل بيانات التذييل. الرجاء المحاولة لاحقاً."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchFooter();
  }, []);

  const handleChange = (key, value) => {
    // Clear previous success when user modifies anything
    setSuccessMessage(null);
    setFooterData((prev) => (prev ? { ...prev, [key]: value } : { [key]: value }));
  };

  const handleSave = async () => {
    if (!footerData) {
      const msg = "لا توجد بيانات لحفظها.";
      setError(msg);
      return { success: false, message: msg };
    }
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      Object.entries(footerData).forEach(([key, value]) => {
        // ensure we don't append undefined
        formData.append(key, value ?? "");
      });

      const res = await fetchClient("/api/footer", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`خطأ في الاستجابة من الخادم: ${res.status} ${text}`);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "خطأ أثناء الحفظ");

      setSuccessMessage("تم حفظ التغييرات بنجاح.");
      return { success: true };
    } catch (err) {
      const message = err?.message || "حدث خطأ أثناء الحفظ. الرجاء المحاولة لاحقاً.";
      console.error("Footer save error:", err);
      setError(message);
      return { success: false, message };
    } finally {
      setSaving(false);
    }
  };

  return {
    footerData,
    loading,
    saving,
    error, // string|null
    successMessage, // string|null
    handleChange,
    handleSave,
  };
}
