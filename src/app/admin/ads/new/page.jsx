"use client";
import { useRouter } from "next/navigation";
import { AdForm } from "../../../../../components/forms";
import useCreateNewAd from "../../../../../hooks/create/useCreateNewAd";

export default function NewAdPage() {

    const { handleSubmit, submitting, errors, goBack } = useCreateNewAd();
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
