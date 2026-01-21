"use client";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import BranchForm from "../../../../../../components/forms/BranchForm";
import { fetchClient } from "@/lib/fetchClient";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";

export default function UpdateStoreSectionPage() {
    const params = useParams();
    const router = useRouter();
    const sectionId = params?.id;

    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSection() {
            try {
                const res = await fetchClient(`/api/store-sections/${sectionId}`);
                const json = await res.json();
                if (!res.ok || json.success === false) {
                    throw new Error(json.message || "فشل تحميل بيانات القسم");
                }
                setSection(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (sectionId) fetchSection();
    }, [sectionId]);

    const handleSubmit = async (formData) => {
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description || "");
            if (formData.image) {
                data.append("logo", formData.image); // Sections often use 'logo' as well in this backend
            }
            data.append("_method", "POST");

            const res = await fetchClient(`/api/store-sections/${sectionId}`, {
                method: "POST",
                body: data,
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                toast.error(json.message || "فشل تحديث القسم");
                return;
            }

            toast.success("تم تحديث القسم بنجاح");
            router.back();
            router.refresh();
        } catch (error) {
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <SectionLayout title="تعديل قسم المتجر" backHref="back">
            <ConditionalRender loading={loading} error={error} loadingText="جاري تحميل بيانات القسم">
                {section && (
                    <BranchForm
                        initialData={{
                            id: section.id,
                            name: section.name,
                            // description: section.description,
                            imageUrl: section.logo || section.image,
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => router.back()}
                        isEditMode={true}
                        type="sub"
                    />
                )}
            </ConditionalRender>
        </SectionLayout>
    );
}
