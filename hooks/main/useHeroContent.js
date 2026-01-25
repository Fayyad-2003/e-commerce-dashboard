"use client";
import { useState, useCallback } from "react";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

export default function useHeroContent() {
    const {
        data: heroContent,
        loading,
        error: err,
        reload,
        setData: setHeroContent
    } = useFetchList({
        url: "/api/admin/hero-contents"
    });

    const [saving, setSaving] = useState(false);

    async function updateHeroContent(formData) {
        setSaving(true);
        try {
            const res = await fetchClient("/api/admin/hero-contents", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to update hero content");
            }

            toast.success(json.message || "Hero content updated successfully ✅");
            reload(); // Refresh data to show latest content
            return true;
        } catch (e) {
            toast.error(`Error: ${e?.message || e}`);
            return false;
        } finally {
            setSaving(false);
        }
    }

    return {
        heroContent,
        loading,
        err,
        saving,
        updateHeroContent,
        reload
    };
}
