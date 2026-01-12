'use client'
import { BundleForm } from "../../../../../components/forms";
import useCreateNewBundle from "../../../../../hooks/create/useCreateNewBundle";

export default function NewOfferPage(){

    const { handleSubmit, submitting, error, goBack } = useCreateNewBundle();
    return (
        <BundleForm
          onSubmit={handleSubmit}
          onCancel={goBack}
          submitting={submitting}
        />
    )
}