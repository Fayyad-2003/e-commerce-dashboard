"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../../../../../../../components/products/ProductForm";
import { fetchClient } from "../../../../../../lib/fetchClient";

export default function StoreProductUpdatePage() {
    const params = useParams();
    const id = params?.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(Boolean(!id));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Missing product id");
            setLoading(false);
            return;
        }

        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const res = await fetchClient(`/api/admin/store-products/${id}`, {
                    credentials: "include",
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.message || "فشل جلب المنتج");
                if (mounted) setProduct(json.data);
            } catch (err) {
                if (mounted) setError(err?.message || String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [id]);

    if (loading) return <div>جاري التحميل...</div>;
    if (error) return <div className="text-red-500">خطأ: {error}</div>;

    return (
        <div className="p-6">
            <ProductForm
                product={product}
                updateBaseUrl="/api/admin/store-products/update"
            />
        </div>
    );
}
