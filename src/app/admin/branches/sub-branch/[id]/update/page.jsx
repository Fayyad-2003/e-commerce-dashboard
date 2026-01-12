"use client";
import { ConditionalRender } from "../../../../../../../components/common";
import { BranchForm } from "../../../../../../../components/forms";
import useEditSubBranch from "../../../../../../../hooks/update/useEditSubBranch";
  
export default function EditBranchPage() {
  const { loading, err, initial, handleSubmit, goBack } = useEditSubBranch();

  return (
    <div className="p-6">
      <ConditionalRender loading={loading} error={err}>
        <BranchForm
          initialData={initial}
          isEditMode={true}
          type="sub"
          isSubmitting={false}
          onSubmit={handleSubmit}
          onCancel={goBack}
        />
      </ConditionalRender>
    </div>
  );
}
