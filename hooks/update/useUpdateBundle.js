"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

/**
 * useUpdateBundle
 * - Fetches bundle by ID from /api/offers/:id
 * - Exposes initialData shaped for your BundleForm and a handleSubmit that accepts either FormData or a plain object.
 */
export default function useUpdateBundle() {
  const router = useRouter();
  const params = useParams();
  const bundleId = params?.bundleId || params?.id || null;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(Boolean(bundleId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // helper: extract an image string from different possible keys
  function extractImage(obj) {
    if (!obj) return null;
    return (
      obj.img ??
      obj.image ??
      obj.img_path ??
      (Array.isArray(obj.full_image_urls) && obj.full_image_urls[0]) ??
      (Array.isArray(obj.images) && obj.images[0]) ??
      null
    );
  }

  // helper: parse quantity robustly
  function parseQty(p) {
    if (!p) return 1;
    const pivotQty =
      p?.pivot?.quantity ?? p?.pivot?.qty ?? p?.quantity ?? p?.qty ?? 1;
    const n = Number(pivotQty);
    return Number.isFinite(n) && !Number.isNaN(n) && n >= 0 ? n : 1;
  }

  useEffect(() => {
    if (!bundleId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetchClient(`/api/offers/${bundleId}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        // attempt to parse JSON safely
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          // server may return useful message
          throw new Error(data?.message || `Fetch failed with ${res.status}`);
        }

        // many APIs wrap payload in data, bundle, or return directly
        const bundle =
          data?.data ?? data?.bundle ?? data?.item ?? data ?? {};

        // if API returns list, attempt to pick first
        const chosen = Array.isArray(bundle) ? bundle[0] ?? {} : bundle;

        const mapped = {
          id: chosen?.id ?? bundleId,
          name: chosen?.name ?? "",
          price: chosen?.price ?? "",
          start_date: chosen?.start_date ?? chosen?.startDate ?? "",
          end_date: chosen?.end_date ?? chosen?.endDate ?? "",
          // keep raw image path (string) — your form will normalize to storage url
          img: extractImage(chosen),
          products:
            (chosen?.products || []).map((p) => ({
              id: Number(p.id),
              name: p.name ?? "",
              base_price: Number(p.base_price ?? 0),
              // quantity used by your form
              quantity: parseQty(p),
              // prefer full_image_urls then images array
              image:
                (Array.isArray(p.full_image_urls) && p.full_image_urls[0]) ||
                (Array.isArray(p.images) && p.images[0]) ||
                p.image ||
                "",
              raw: p,
            })) || [],
          raw: chosen,
        };

        if (!cancelled) {
          setInitialData(mapped);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // fetch was aborted — ignore
          return;
        }
        console.error("useUpdateBundle fetch error:", err);
        if (!cancelled) setError(err.message || "فشل جلب الباندل");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [bundleId]);

  /**
   * handleSubmit
   * Accepts:
   * - FormData (passed directly through)
   * - plain object { name, price, start_date, end_date, image (File|string), product_ids (array|string|number) }
   *
   * On success it navigates back to /admin/bundles (same as your original hook).
   */
  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      let formData;

      if (typeof FormData !== "undefined" && data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();

        formData.append("name", data.name ?? "");
        formData.append("price", data.price ?? "");
        formData.append("start_date", data.start_date ?? "");
        formData.append("end_date", data.end_date ?? "");

        // image handling: if File -> append as upload; if string -> send as existing_image so backend can keep it
        if (typeof File !== "undefined" && data.img instanceof File) {
          formData.append("img", data.img);
        } else if (typeof data.img === "string" && data.img) {
          // some backends expect an explicit field for keeping existing image
          formData.append("img", data.img);
        }

        // product ids: support multiple shapes (array of ids, array of product objects, or repeated)
        if (Array.isArray(data.product_ids)) {
          data.product_ids.forEach((id) => {
            // support objects (e.g. selectedProducts) -> id prop
            const val = typeof id === "object" ? id.id ?? id.product_id : id;
            formData.append("product_ids[]", String(val));
          });
        } else if (Array.isArray(data.products)) {
          // maybe caller passed selectedProducts array of objects
          data.products.forEach((p) => {
            const val = p?.id ?? p?.product_id;
            if (val != null) formData.append("product_ids[]", String(val));
          });
        } else if (data.product_ids != null) {
          formData.append("product_ids[]", String(data.product_ids));
        }
      }

      // choose HTTP method — many backends use POST for multipart updates; if you want PATCH change here
      const res = await fetchClient(`/api/offers/${bundleId}`, {
        method: "POST",
        body: formData,
      });

      // safe json parse
      const text = await res.text();
      const out = text ? JSON.parse(text) : {};

      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || `Save failed (${res.status})`);
      }

      // success -> navigate back to listing
      router.push("/admin/bundles");
    } catch (err) {
      console.error("useUpdateBundle submit error:", err);
      setError(err.message || "فشل الحفظ");
      // rethrow if caller wants to catch (optional)
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    initialData,
    loading,
    submitting,
    error,
    handleSubmit,
    goBack: () => router.back(),
  };
}
