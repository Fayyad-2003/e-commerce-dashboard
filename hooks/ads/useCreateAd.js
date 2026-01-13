"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useCreateAd() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    /** ✅ Submit new ad */
    const handleSubmit = async (formData) => {
        setSubmitting(true);
        setErrors({});

        try {
            const form = new FormData();
            for (const key of ["title", "description", "link", "position", "start_date", "end_date"]) {
                form.append(key, formData[key] ?? "");
            }
            form.append("is_active", formData.is_active ? "1" : "0");

            // Handle image upload
            if (formData.image) {
                form.append("image", formData.image);
            }

            const res = await fetchClient("/api/ads", {
                method: "POST",
                body: form,
            });

            const out = await res.json().catch(() => ({}));
            if (!res.ok || out?.success === false) {
                // Check for validation errors
                if (out?.errors && typeof out.errors === 'object') {
                    setErrors(out.errors);
                } else {
                    setErrors({ form: out?.message || "فشل إنشاء الإعلان" });
                }
                return;
            }

            router.push("/admin/ads");
        } catch (err) {
            setErrors({ form: err.message || "حدث خطأ أثناء إنشاء الإعلان" });
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
