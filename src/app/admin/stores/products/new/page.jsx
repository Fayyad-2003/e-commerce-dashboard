"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductForm from "../../../../../components/products/ProductForm";

function NewStoreProductContent() {
    const searchParams = useSearchParams();
    const subId = searchParams.get("subId");

    return (
        <div className="p-6">
            <ProductForm
                defaultSubCategoryId={subId}
                redirectBaseUrl="/admin/stores/products"
            />
        </div>
    );
}

export default function NewStoreProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewStoreProductContent />
        </Suspense>
    );
}
