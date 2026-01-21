"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchClient } from "@/lib/fetchClient";
import BranchForm from "components/forms/BranchForm"; // Components is likely in ROOT based on previous ls
import { SectionLayout } from "components/common";

export default function NewStoreCategoryPage() {
    const router = useRouter();

    const handleSubmit = async (formData) => {
        try {
            // Transform object to FormData for file upload
            const data = new FormData();
            data.append("name", formData.name);
            // Image handling removed
            // if (formData.image) {
            //     data.append("image", formData.image);
            // }

            const res = await fetchClient("/api/store-categories", {
                method: "POST",
                body: data,
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                toast.error(json.message || "فشل إنشاء التصنيف");
                return;
            }

            toast.success("تم إنشاء تصنيف المتجر بنجاح");
            router.push("/admin/stores"); // Return to list
            router.refresh();
        } catch (error) {
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <SectionLayout title="إضافة تصنيف متجر جديد" backHref="/admin/stores">
            <BranchForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                type="main" // "main" usually means Main Category in BranchForm logic
                hideImage={true}
            />
        </SectionLayout>
    );
}
