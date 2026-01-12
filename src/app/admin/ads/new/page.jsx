"use client";
import { useRouter } from "next/navigation";
import AdForm from "../../../../../components/features/ads/AdForm";
import useCreateAd from "../../../../../hooks/ads/useCreateAd";

export default function NewAdPage() {

    const { handleSubmit, submitting, errors, goBack } = useCreateAd();
    return (
        <div className="container mx-auto p-4">
            <AdForm
                onSubmit={handleSubmit}
                onCancel={goBack}
                submitting={submitting}
                errors={errors}
            />
        </div>
    );
}
