"use client";
import { ConditionalRender } from "../../../../../../components/common";
import { DiscountForm } from "../../../../../../components/forms";
import { useEditDiscount } from "../../../../../../hooks";

export default function Page() {
  const { initialData, loading, submitting, errors, handleSubmit, goBack } = useEditDiscount();
  return (
    <ConditionalRender
      loading={loading}
      error={errors.form && !initialData ? errors.form : ""}
    >
      <DiscountForm
        initialData={initialData}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={goBack}
        errors={errors}
      />
    </ConditionalRender>
  );
}
