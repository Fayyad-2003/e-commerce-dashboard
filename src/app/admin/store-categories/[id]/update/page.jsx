"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BranchForm from "../../../../../components/forms/BranchForm";
import { fetchClient } from "@/lib/fetchClient";
import { ConditionalRender, SectionLayout } from "../../../../../components/common";

export default function UpdateStoreCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.id;

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCategory() {
            try {
                const res = await fetchClient(`/api/store-categories/${categoryId}`);
                const json = await res.json();
                if (!res.ok || json.success === false) {
                    throw new Error(json.message || "فشل تحميل بيانات التصنيف");
                }
                setCategory(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (categoryId) fetchCategory();
    }, [categoryId]);

    const handleSubmit = async (formData) => {
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description || "");
            if (formData.image) {
                data.append("image", formData.image);
            }
            data.append("_method", "PUT");

            const res = await fetchClient(`/api/store-categories/${categoryId}`, {
                method: "POST",
                body: data,
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                alert(json.message || "فشل تحديث التصنيف");
                return;
            }

            alert("تم تحديث التصنيف بنجاح");
            router.back();
            router.refresh();
        } catch (error) {
            alert(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <SectionLayout title="تعديل تصنيف المتجر" backHref="/admin/stores">
            <ConditionalRender loading={loading} error={error} loadingText="جاري تحميل بيانات التصنيف">
                {category && (
                    <BranchForm
                        initialData={{
                            id: category.id,
                            name: category.name,
                            description: category.description,
                            imageUrl: category.image,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.back()}
                        isEditMode={true}
                        type="category"
                    />
                )}
            </ConditionalRender>
        </SectionLayout>
    );
}
