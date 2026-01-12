"use client";
import { useParams } from "next/navigation";
import { fetchClient } from "../../../../lib/fetchClient";
import { useEffect, useState } from "react";
import Form from "../../../../../components/products/Form";
import dynamic from "next/dynamic";

export function Page() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetchClient(`/api/products/${id}`, {
          method: "GET",
        });

        if (res.status === 401) {
          window.location.href = "/auth/login";
          return;
        }

        const data = await res.json();

        if (!data.success) {
          setError(data.message || "فشل جلب المنتج");
        } else {
          // backend response may be in data.data or directly payload
          setProduct(data.data ?? data);
        }
      } catch (e) {
        setError(e?.message || "خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  return (
    <div className="p-6">
      <Form product={product} />
    </div>
  );
}


export default dynamic(() => Promise.resolve(Page), { ssr: false });
