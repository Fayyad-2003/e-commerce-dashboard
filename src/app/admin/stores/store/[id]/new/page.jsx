"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import BranchForm from "../../../../../../../components/forms/BranchForm";
import { fetchClient } from "@/lib/fetchClient";

export default function NewStoreSectionPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.id;
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("store_id", storeId);
            if (data.image) {
                formData.append("image", data.image);
            }

            const res = await fetchClient(`/api/stores/${storeId}/store-sections`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.message || "فشل إنشاء القسم");
                return;
            }

            router.push(`/admin/stores/store/${storeId}`);
        } catch (error) {
            alert("حدث خطأ غير متوقع");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="py-8">
            <BranchForm
                type="sub"
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                onCancel={() => router.back()}
            />
        </div>
    );
}
