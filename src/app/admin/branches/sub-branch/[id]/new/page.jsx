"use client";
import { BranchForm } from "../../../../../../../components/forms";
import { useCreateSubBranch } from "../../../../../../../hooks";

export default function Page() {
  const { handleSubmitSub, isSubmittingSub, goBack } = useCreateSubBranch();
  return (
    <BranchForm
      onSubmit={handleSubmitSub}
      isSubmitting={isSubmittingSub}
      onCancel={goBack}
      type="sub"
    />
  );
}
