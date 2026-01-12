"use client";
import { BranchForm } from "../../../../../components/forms";
import { useAddMainBranch } from "../../../../../hooks";

export default function Page() {
  const { isSubmitting, handleSubmit, onCancel } = useAddMainBranch();

  return (
    <BranchForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      type="main"
    />
  );
}
