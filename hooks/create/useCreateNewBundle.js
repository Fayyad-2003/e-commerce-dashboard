"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import toast from "react-hot-toast";

/**
 * useCreateNewBundle
 * - handleSubmit accepts either FormData or a plain object:
 *   { name, price, start_date, end_date, image(File|string), product_ids: [ids] | products: [{id, qty}] }
 */
export default function useCreateNewBundle() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const buildFormDataFromObject = (data) => {
    const fd = new FormData();

    fd.append("name", data.name ?? "");
    fd.append("price", data.price ?? "");
    fd.append("start_date", data.start_date ?? "");
    fd.append("end_date", data.end_date ?? "");

    // image: if File -> append as upload; if string -> send as existing_image for backend to keep
    if (typeof File !== "undefined" && data.img instanceof File) {
      fd.append("img", data.img);
    }

    // products / product_ids: support multiple shapes
    if (Array.isArray(data.product_ids)) {
      data.product_ids.forEach((id) => {
        // support objects in array as well
        const val = typeof id === "object" ? id.id ?? id.product_id : id;
        if (val != null) fd.append("product_ids[]", String(val));
      });
    } else if (Array.isArray(data.products)) {
      // maybe selectedProducts array with objects { id, qty }
      data.products.forEach((p) => {
        const val = p?.id ?? p?.product_id;
        if (val != null) fd.append("product_ids[]", String(val));
      });
    } else if (Array.isArray(data.selectedProducts)) {
      data.selectedProducts.forEach((p) => {
        const val = p?.id ?? p?.product_id;
        if (val != null) fd.append("product_ids[]", String(val));
      });
    } else if (data.product_ids != null) {
      fd.append("product_ids[]", String(data.product_ids));
    }

    return fd;
  };

  /** Submit new bundle */
  const handleSubmit = async (formDataOrObject) => {
    setSubmitting(true);
    setError("");

    try {
      let body;
      if (typeof FormData !== "undefined" && formDataOrObject instanceof FormData) {
        body = formDataOrObject;
      } else {
        body = buildFormDataFromObject(formDataOrObject ?? {});
      }

      const res = await fetchClient("/api/offers", {
        method: "POST",
        body,
      });

      // safe json parse
      const text = await res.text();
      const out = text ? JSON.parse(text) : {};

      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || `فشل إنشاء الباندل (${res.status})`);
      }

      // optionally return created bundle to caller by resolving; but maintain navigation like before
      toast.success("تم إنشاء الباندل بنجاح");
      router.push("/admin/bundles");
      return out?.data ?? out;
    } catch (err) {
      console.error("create bundle error:", err);
      setError(err?.message || "حدث خطأ أثناء إنشاء الباندل");
      // rethrow so caller can optionally handle
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    handleSubmit,
    goBack: () => router.back(),
  };
}
