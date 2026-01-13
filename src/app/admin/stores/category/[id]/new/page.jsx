"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import BranchForm from "../../../../../../../components/forms/BranchForm";
import { fetchClient } from "@/lib/fetchClient";

export default function NewStorePage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.id;
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description || "");
            formData.append("store_category_id", categoryId);
            if (data.image) {
                formData.append("image", data.image);
            }

            const res = await fetchClient("/api/stores", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || "فشل إنشاء المتجر");
                return;
            }

            router.push(`/admin/stores/category/${categoryId}`);
        } catch (error) {
            alert("حدث خطأ غير متوقع");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="py-8">
            <BranchForm
                type="main"
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                onCancel={() => router.back()}
            />
        </div>
    );
}
