'use client'
import { UnitsOfMeasureForm } from "../../../../../../components/forms";
import useEditUnit from "../../../../../../hooks/update/useEditUnitsOfMeasure";

export default function Page() {
  const { initialData, loading, submitting, error, handleSubmit } = useEditUnit();

  return (
    <div className="p-6">
      <UnitsOfMeasureForm
        initialData={initialData}
        loading={loading}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
