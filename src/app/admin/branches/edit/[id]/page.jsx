"use client";
import { ConditionalRender } from "../../../../../../components/common";
import { BranchForm } from "../../../../../../components/forms";
import { useEditMainBranch } from "../../../../../../hooks";
 
export default function EditBranchPage() {
  const { loading, err, initial, handleSubmit, onCancel } =
    useEditMainBranch();

  return (
    <div className="p-6">
      <ConditionalRender loading={loading} error={err}>
        <BranchForm
          initialData={initial}
          isEditMode={true}
          type="main"
          isSubmitting={false}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </ConditionalRender>
    </div>
  );
}
