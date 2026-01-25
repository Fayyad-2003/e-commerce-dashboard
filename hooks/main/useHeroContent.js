"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchClient } from "../../src/lib/fetchClient";
import toast from "react-hot-toast";

export default function useHeroContent() {
    const [heroContent, setHeroContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchHeroContent = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchClient("/api/admin/hero-contents");
            const json = await res.json();
            if (res.ok && json.success) {
                setHeroContent(json.data);
            } else {
                throw new Error(json.message || "فشل تحميل البيانات");
            }
        } catch (e) {
            console.error(e);
            setError(e.message);
            // Optional: don't show toast on load error if not critical, or show localized
            // toast.error("تعذر تحميل محتوى الواجهة"); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHeroContent();
    }, [fetchHeroContent]);

    async function updateHeroContent(formData) {
        setSaving(true);
        try {
            const res = await fetchClient("/api/admin/hero-contents", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "فشل تحديث المحتوى");
            }

            toast.success("تم تحديث محتوى الواجهة بنجاح ✅");
            fetchHeroContent(); // Refresh data to show latest content
            return true;
        } catch (e) {
            toast.error(`خطأ: ${e?.message || e}`);
            return false;
        } finally {
            setSaving(false);
        }
    }

    return {
        heroContent,
        loading,
        error,
        saving,
        updateHeroContent,
        reload: fetchHeroContent
    };
}
