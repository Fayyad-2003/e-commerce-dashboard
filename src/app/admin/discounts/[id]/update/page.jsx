"use client";
import { ConditionalRender } from "../../../../../../components/common";
import { DiscountForm } from "../../../../../../components/forms";
import { useEditDiscount } from "../../../../../../hooks";

export default function Page() {
  const { initialData, loading, submitting, error, handleSubmit, goBack } = useEditDiscount();
  return (
    <ConditionalRender
     loading={loading}
     error={error}
    >
    <DiscountForm
      initialData={initialData}
      submitting={submitting}
      onSubmit={handleSubmit}
      onCancel={goBack}
    />
    </ConditionalRender>
  );
}
