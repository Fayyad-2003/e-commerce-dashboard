"use client";
import { ConditionalRender } from "../../../../../../components/common";
import { AdForm } from "../../../../../../components/forms";
import { useEditAd } from "../../../../../../hooks";

export default function Page() {
    const { initialData, loading, submitting, errors, handleSubmit, goBack } = useEditAd();
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
