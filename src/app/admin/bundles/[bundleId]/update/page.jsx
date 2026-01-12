"use client";
import { ConditionalRender } from "../../../../../../components/common";
import { BundleForm } from "../../../../../../components/forms";
import { useUpdateBundle } from "../../../../../../hooks";

export default function EditBundlePage() {
  const { initialData, loading, submitting, error, handleSubmit, goBack } = useUpdateBundle();

  return (
    <div className="p-4 sm:p-6">
      <ConditionalRender
        loading={loading}
        error={error}
      >
        <BundleForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitting={submitting}
          onCancel={goBack}
        />
      </ConditionalRender>
    </div>
  );
}
