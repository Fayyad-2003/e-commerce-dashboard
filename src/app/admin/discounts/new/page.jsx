"use client";
import { useRouter } from "next/navigation";
import { DiscountForm } from "../../../../../components/forms";
import useCreateNewDiscount from "../../../../../hooks/create/useCreateNewDiscount";

export default function NewDiscountPage() {

  const { handleSubmit, submitting, error, goBack } = useCreateNewDiscount();
  return (
    <div className="container mx-auto p-4">
      <DiscountForm
        onSubmit={handleSubmit}
        onCancel={goBack}
        submitting={submitting}
      />
    </div>
  );
}
