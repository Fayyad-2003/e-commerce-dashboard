"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useUpdateAd() {
    const router = useRouter();
    const params = useParams();
    const adId = params?.id;

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    /** ✅ Fetch ad */
    useEffect(() => {
        if (!adId) return;

        (async () => {
            setLoading(true);
            setErrors({});

            try {
                const res = await fetchClient(`/api/ads/${adId}`, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || "فشل جلب البيانات");

                const ad = data?.data ?? data;

                setInitialData({
                    image_url: ad?.full_image_url || ad?.image || "",
                });
            } catch (err) {
                setErrors({ form: err.message || "فشل جلب البيانات" });
            } finally {
                setLoading(false);
            }
        })();
    }, [adId]);

    /** ✅ Submit */
    const handleSubmit = async (formData) => {
        setSubmitting(true);
        setErrors({});

        try {
            const form = new FormData();
            if (formData.image) {
                form.append("image", formData.image);
            }

            const res = await fetchClient(`/api/ads/${adId}`, {
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

            router.push("/admin/ads");
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
