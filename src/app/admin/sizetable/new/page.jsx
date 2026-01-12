"use client";
import { useAddUnitOfMeasure } from "../../../../../hooks";
import { UnitsOfMeasureForm } from "../../../../../components/forms";

export default function AddSizePage() {
  
  const {
    label,
    isSubmitting,
    handleSubmit,
    cancel,
  } = useAddUnitOfMeasure();

  return (
    <div className="relative font-sans sm:p-20 p-4">
      <UnitsOfMeasureForm
        initialData={{ name: label }}
        onSubmit={handleSubmit}
        onCancel={cancel}
        submitting={isSubmitting}
      />
    </div>
  );
}
