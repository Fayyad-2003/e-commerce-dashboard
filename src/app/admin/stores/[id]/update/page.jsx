"use client";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import BranchForm from "../../../../../../components/forms/BranchForm";
import { fetchClient } from "@/lib/fetchClient";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";

export default function UpdateStorePage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params?.id;

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStore() {
            try {
                const res = await fetchClient(`/api/stores/${storeId}`);
                const json = await res.json();
                if (!res.ok || json.success === false) {
                    throw new Error(json.message || "فشل تحميل بيانات المتجر");
                }
                setStore(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (storeId) fetchStore();
    }, [storeId]);

    const handleSubmit = async (formData) => {
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description || "");
            if (formData.image) {
                data.append("logo", formData.image); // Backend expects 'logo'
            }
            // For Laravel/PHP updates via FormData, we often need _method=PUT
            data.append("_method", "POST");

            const res = await fetchClient(`/api/stores/${storeId}`, {
                method: "POST",
                body: data,
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                toast.error(json.message || "فشل تحديث المتجر");
                return;
            }

            toast.success("تم تحديث المتجر بنجاح");
            router.back();
            router.refresh();
        } catch (error) {
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <SectionLayout title="تعديل المتجر" backHref="back">
            <ConditionalRender loading={loading} error={error} loadingText="جاري تحميل بيانات المتجر">
                {store && (
                    <BranchForm
                        initialData={{
                            id: store.id,
                            name: store.name,
                            description: store.description,
                            imageUrl: store.logo,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.back()}
                        isEditMode={true}
                        type="store"
                    />
                )}
            </ConditionalRender>
        </SectionLayout>
    );
}
