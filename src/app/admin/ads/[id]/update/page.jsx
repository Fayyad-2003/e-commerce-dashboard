"use client";
import { ConditionalRender } from "../../../../../../components/common";
import AdForm from "../../../../../../components/features/ads/AdForm";
import useUpdateAd from "../../../../../../hooks/ads/useUpdateAd";

export default function Page() {
    const { initialData, loading, submitting, errors, handleSubmit, goBack } = useUpdateAd();
    return (
        <ConditionalRender
            loading={loading}
            error={errors.form && !initialData ? errors.form : ""}
        >
            <AdForm
                initialData={initialData}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={goBack}
                errors={errors}
            />
        </ConditionalRender>
    );
}
