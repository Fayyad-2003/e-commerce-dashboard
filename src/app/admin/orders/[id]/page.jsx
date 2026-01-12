"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchClient } from "../../../../lib/fetchClient";
import Link from "next/link";
import Image from "next/image"; // ✅ Next.js Image Component Import
import { ConditionalRender } from "../../../../../components/common";

/* Style-sync with OrderTable:
   - container: bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto
   - header: flex justify-between items-center mb-6 border-b pb-4
   - title color: var(--primary-brown)
   - compact item rows with divide-y
   - buttons match OrderTable (border-[var(--primary-brown)], green primary for complete)
*/

function fmt(dateStr) {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr || "-";
  }
}

function fmtMoney(amountStr) {
  if (amountStr == null) return "-";
  const n = Number(amountStr);
  if (Number.isNaN(n)) return amountStr;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Return a normalized safe URL string or null if invalid/unsafe.
 * Rules:
 * - Reject schemes: javascript:, data:, vbscript:, and protocol-relative //
 * - Use URL(...) with window.location.origin as base so relative paths are handled
 * - Allow only http: and https:
 */
function getSafeSrc(raw) {
  if (!raw) return null;
  try {
    const s = String(raw).trim();
    if (!s) return null;
    const lower = s.toLowerCase();

    // Reject dangerous/ambiguous schemes and protocol-relative URLs
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("//")
    ) {
      return null;
    }

    // Normalize via URL with page origin as base (handles relative paths)
    const url = new URL(s, window.location.origin);

    // Only allow http(s)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    // Optional: strip credentials if present
    url.username = "";
    url.password = "";

    return url.toString();
  } catch (e) {
    // invalid URL
    return null;
  }
}

/**
 * Build an image URL from a storage path or absolute URL.
 * If the incoming path is already an absolute/relative URL string, it will be validated.
 * If it's a simple storage path (filename), we will attempt to use NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_IMAGES.
 */
function resolveImageUrl(path) {
  if (!path) return null;

  const raw = String(path).trim();
  if (!raw) return null;

  // If path already looks like a URL or starts with a slash, validate it directly
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/")
  ) {
    return getSafeSrc(raw);
  }

  // Try environment base variables (client-side). Prefer NEXT_PUBLIC_IMAGES then NEXT_PUBLIC_API_BASE_URL
  const imgBase =
    process.env.NEXT_PUBLIC_IMAGES ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  if (imgBase) {
    // Normalize base (remove trailing slash)
    const base = imgBase.endsWith("/") ? imgBase.slice(0, -1) : imgBase;
    const candidate = `${base}/${raw.replace(/^\/+/, "")}`;
    return getSafeSrc(candidate);
  }

  // Fallback to /storage/<path>
  return getSafeSrc(`/storage/${raw.replace(/^\/+/, "")}`);
}

const STATUS_MAP = {
  pending: { label: "قيد الانتظار", style: "bg-yellow-100 text-yellow-800" },
  processing: { label: "قيد المعالجة", style: "bg-blue-100 text-blue-800" },
  completed: { label: "مكتمل", style: "bg-green-100 text-green-800" },
  cancelled: { label: "ملغى", style: "bg-red-100 text-red-800" },
};

function Badge({ status }) {
  const s = STATUS_MAP[status] || {
    label: status || "-",
    style: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.style}`}>
      {s.label}
    </span>
  );
}

// ✅ FIX 2: Function to sanitize order data immediately on fetch
/**
 * Ensures all image URLs in the incoming order data are safe
 * before being committed to React state. Addresses the DOMXSS warning on state flow.
 */
function sanitizeOrderData(orderData) {
  if (!orderData || !orderData.items) return orderData;

  const sanitizedItems = orderData.items.map((item) => {
    // 1. Sanitize product image array (full_image_urls)
    if (item.product?.full_image_urls) {
      item.product.full_image_urls = item.product.full_image_urls
        .map(getSafeSrc)
        .filter((url) => url !== null); // Remove any null/unsafe entries
    }

    // 2. Sanitize product image string (if it exists)
    if (item.product?.images?.[0]) {
      const safePath = resolveImageUrl(item.product.images[0]);
      // Update the item to hold only the safe path, or null if unsafe
      item.product.images[0] = safePath;
    }

    // 3. Sanitize bundle image string (img)
    if (item.bundle?.img) {
      const safeImg = resolveImageUrl(item.bundle.img);
      // Update the item to hold only the safe path, or null if unsafe
      item.bundle.img = safeImg;
    }

    return item;
  });

  return { ...orderData, items: sanitizedItems };
}
// End FIX 2: Sanitize function

/**
 * Smartly Determine Discount Label
 * Based on user data:
 * - subtotal: 2000
 * - discount: 400
 * - value: 20
 * - type: 'order_total' -> This is clearly 20% (2000 * 0.20 = 400)
 */
function getDiscountLabel(order) {
  if (!order || !Number(order.discount_amount)) return null;

  const discountAmount = Number(order.discount_amount);
  const subtotal = Number(order.subtotal || 0);
  const val = Number(order.applied_discount_value || 0);

  // 1. Explicit percentage type
  if (order.applied_discount_type === "percentage") {
    return `خصم (${val}%)`;
  }

  // 2. Smart detection for "order_total" or "fixed" acting as percentage
  // If we have a value (e.g. 20) and subtotal (2000), let's see if 20% of 2000 matches discount_amount (400)
  if (subtotal > 0 && val > 0) {
    const calculatedPercentAmount = subtotal * (val / 100);
    // weak equality check for floating point loose precision (within 0.1)
    if (Math.abs(calculatedPercentAmount - discountAmount) < 0.1) {
      return `خصم (${val}%)`; // It's a percentage!
    }
  }

  // 3. Fallback / Fixed logic
  // If the value matches the amount exactly, it's just a fixed discount
  // e.g. value=400, amount=400
  if (Math.abs(val - discountAmount) < 0.1) {
    return "خصم ثابت";
  }

  // 4. Generic default if we can't figure out the source
  return "الخصم";
}

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function fetchOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchClient(`/api/orders/${id}`);
      if (!res.ok) {
        let text;
        try {
          const j = await res.json();
          text = j?.message || JSON.stringify(j);
        } catch {
          text = await res.text();
        }
        throw new Error(text || `HTTP ${res.status}`);
      }
      const json = await res.json();

      // ✅ FIX 2: Use the sanitization function here before setting state
      if (json?.success) setOrder(sanitizeOrderData(json.data));
      else throw new Error(json?.message || "تعذر تحميل تفاصيل الطلب");
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleChangeStatus(newStatus) {
    if (!order) return;
    if (
      !confirm(
        `هل أنت متأكد من تغيير حالة الطلب إلى "${STATUS_MAP[newStatus]?.label || newStatus
        }"؟`
      )
    )
      return;
    setSaving(true);
    const prev = order.status;
    setOrder({ ...order, status: newStatus }); // optimistic
    try {
      const res = await fetchClient(`/api/orders/${order.id}/complete`, {
        method: "POST",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `فشل تحديث الحالة (${res.status})`);
      }
      await fetchOrder();
    } catch (err) {
      alert(`تعذر تحديث الحالة: ${err?.message || err}`);
      setOrder({ ...order, status: prev });
    } finally {
      setSaving(false);
    }
  }

  function getProductImage(it) {
    // prefer validated full_image_urls, fall back to stored images or bundle image
    const full = it.product?.full_image_urls?.[0];
    const safeFull = getSafeSrc(full);
    if (safeFull) return safeFull;

    const img = it.product?.images?.[0];
    const safeImg = resolveImageUrl(img);
    if (safeImg) return safeImg;

    const bundleImg = it.bundle?.img;
    const safeBundle = resolveImageUrl(bundleImg);
    if (safeBundle) return safeBundle;

    return null;
  }

  function availableColorsForSize(product, sizeName) {
    try {
      const sizes = product?.attributes?.sizes || [];
      const s = sizes.find((x) => x.name === sizeName);
      return s ? s.colors : [];
    } catch {
      return [];
    }
  }

  const products = order?.items?.filter((it) => !it.bundle) || [];
  const bundles = order?.items?.filter((it) => !!it.bundle) || [];

  return (
    <ConditionalRender
      loading={loading}
      error={error}
      empty={!order}
      loadingText={"جاري التحميل..."}
      emptyText={"لم يتم العثور على الطلب"}
      errorText={error ? `حدث خطأ: ${error}` : undefined}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary-brown)]">
              تفاصيل الطلب
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              #{order?.id || "—"}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Badge status={order?.status} />
              <div className="text-sm text-gray-500">
                تاريخ الإنشاء: {fmt(order?.created_at)}
              </div>
              <div className="text-sm text-gray-500">
                طريقة الدفع: {order?.payment_method === "electronic" ? "الكتروني" : "عند الاستلام"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="px-3 py-2 border border-[var(--primary-brown)] text-[var(--primary-brown)] rounded-md text-sm hover:bg-gray-50"
            >
              العودة
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Products section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--primary-brown)]">
                منتجات فردية
              </h2>
              <div className="text-sm text-gray-600">
                عدد: {products.length}
              </div>
            </div>

            <div>
              {products.length ? (
                products.map((it) => {
                  const productExists = !!it.product;
                  const title = productExists
                    ? it.product?.name || `بند #${it.id}`
                    : "منتج محذوف";
                  const imgUrl = getProductImage(it);
                  const selectedSize = it.size;
                  const selectedColor = it.color;
                  const availableColors = it.product
                    ? availableColorsForSize(it.product, selectedSize)
                    : [];

                  // safe product link (encode id to avoid path injection)
                  const productHref =
                    productExists && it.product?.id
                      ? `/admin/products/${encodeURIComponent(
                        String(it.product.id)
                      )}`
                      : null;

                  return (
                    <div
                      key={it.id}
                      className="flex flex-col sm:flex-row justify-between items-start py-4 gap-4"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* ✅ FIX 1: Change to Image component and add 'relative' to container */}
                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center relative">
                          {imgUrl ? (
                            <Image // <--- Secure component used here
                              src={imgUrl}
                              alt={title}
                              fill // <--- Use fill to cover the fixed-size parent
                              className="object-cover"
                              unoptimized={imgUrl.startsWith("http")}
                            />
                          ) : (
                            <div className="text-xs text-gray-400">
                              لا توجد صورة
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium text-[15px] truncate">
                            {title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            موديل: {it.product?.model_number || "-"}
                          </div>
                          {it.product?.description && (
                            <div className="text-sm text-gray-700 mt-1 line-clamp-2">
                              {it.product.description}
                            </div>
                          )}

                          <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
                            {selectedSize && (
                              <div className="px-2 py-1 text-xs">
                                المقاس:{" "}
                                <span className="font-medium">
                                  {selectedSize}
                                </span>
                              </div>
                            )}
                            {selectedColor && (
                              <div className="px-2 py-1 text-xs">
                                اللون:{" "}
                                <span className="font-medium">
                                  {selectedColor}
                                </span>
                              </div>
                            )}
                          </div>
                          {availableColors.length > 0 && (
                            <div className="mt-2 px-2 py-1 w-fit bg-gray-50 rounded text-xs">
                              ألوان متاحة للمقاس:{" "}
                              <span className="font-medium">
                                {availableColors.join(", ")}
                              </span>
                            </div>
                          )}

                          {productHref ? (
                            <Link
                              className="text-xs text-gray-400 mt-1 line-clamp-2 underline"
                              href={productHref}
                            >
                              معلومات المنتج
                            </Link>
                          ) : (
                            <div className="text-xs text-red-400 mt-1">
                              غير متاح
                            </div>
                          )}

                          {it.notes ? (
                            <div className="mt-2 text-sm text-gray-700">
                              ملاحظات العنصر:{" "}
                              <span className="font-medium">{it.notes}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right mt-2 sm:mt-0">
                        <div className="text-sm text-gray-500">سعر الوحدة</div>
                        <div className="font-medium">
                          {fmtMoney(it.price_per_unit)}
                        </div>
                        <div className="text-xs text-gray-400">
                          الكمية: {it.quantity}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          المجموع:{" "}
                          <span className="font-medium">
                            {fmtMoney(
                              Number(it.price_per_unit) * Number(it.quantity)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-gray-500">
                  لا توجد منتجات فردية في الطلب
                </div>
              )}
            </div>
          </section>

          {/* Bundles section (bundles merged with their notes inline) */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[var(--primary-brown)]">
                العروض / الباقات
              </h2>
              <div className="text-sm text-gray-600">عدد: {bundles.length}</div>
            </div>

            <div>
              {bundles.length ? (
                bundles.map((it) => {
                  const title = it?.bundle?.name || `باقة #${it.id}`;
                  // Use resolveImageUrl so bundle.img gets validated
                  const imgUrl = resolveImageUrl(it?.bundle?.img);

                  return (
                    <div
                      key={it.id}
                      className="flex flex-col sm:flex-row justify-between items-start py-4 gap-4 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* ✅ FIX 1: Change to Image component and add 'relative' to container */}
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center border relative">
                          {imgUrl ? (
                            <Image // <--- Secure component used here
                              src={imgUrl}
                              alt={title}
                              fill // <--- Use fill to cover the fixed-size parent
                              className="object-cover"
                              unoptimized={imgUrl.startsWith("http")}
                            />
                          ) : (
                            <div className="text-xs text-gray-400">
                              لا توجد صورة
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium text-[15px] truncate">
                            {title}
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            سعر الباقة: {fmtMoney(it.price_per_unit)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            تاريخ البداية:{" "}
                            <span className="font-medium">
                              {it.bundle?.start_date
                                ? it.bundle.start_date.split(" ")[0]
                                : "-"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            تاريخ الانتهاء:{" "}
                            <span className="font-medium">
                              {it.bundle?.end_date
                                ? it.bundle.end_date.split(" ")[0]
                                : "-"}
                            </span>
                          </div>

                          {it.notes ? (
                            <div className="mt-2 text-sm text-gray-700">
                              ملاحظات الباقة:{" "}
                              <span className="font-medium">{it.notes}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-right mt-2 sm:mt-0">
                        <div className="text-sm text-gray-500">سعر الوحدة</div>
                        <div className="font-medium">
                          {fmtMoney(it.price_per_unit)}
                        </div>
                        <div className="text-xs text-gray-400">
                          الكمية: {it.quantity}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          المجموع:{" "}
                          <span className="font-medium">
                            {fmtMoney(
                              Number(it.price_per_unit) * Number(it.quantity)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-gray-500">لا توجد عروض في الطلب</div>
              )}
            </div>
          </section>

          {/* Order Notes (display-only) */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-[var(--primary-brown)]">
              ملاحظات الطلب
            </h3>
            <div className="w-full rounded p-3 text-sm min-h-[4rem] text-gray-700">
              {order?.notes || order?.order_notes || order?.customer_notes ? (
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {order?.notes || order?.order_notes || order?.customer_notes}
                </div>
              ) : (
                <div className="text-gray-400">لا توجد ملاحظات من العميل</div>
              )}
            </div>
          </section>

          {/* Customer + Totals (removed shipment and tax rows) */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-[var(--primary-brown)]">
              معلومات العميل
            </h3>
            {order?.user ? (
              <div className="text-sm text-gray-700 space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>الاسم</span>
                  <span className="font-medium">{order.user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>البريد</span>
                  <span className="font-medium underline">
                    {order.user.email || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>الهاتف</span>
                  <span className="font-medium underline">
                    {order.user.phone || "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm mb-4">
                لا توجد بيانات العميل
              </div>
            )}

            <div className="bg-white p-4 rounded border mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي النهائي:</span>
                <span className="text-[var(--primary-brown)]">
                  {fmtMoney(order?.final_total)}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-medium">
                    {fmtMoney(order?.subtotal)}
                  </span>
                </div>
                <DetailedDiscounts order={order} />

                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">إجمالي الخصم</span>
                  <span className="font-medium text-red-600">
                    -{fmtMoney(order?.discount_amount)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Actions: confirm/disabled buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <Link
              href="/admin/orders"
              className="px-6 py-2 border border-[var(--primary-brown)] text-[var(--primary-brown)] rounded-md hover:bg-gray-50 font-medium"
            >
              رجوع للقائمة
            </Link>

            {order?.status === "pending" && (
              <button
                onClick={() => handleChangeStatus("completed")}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                disabled={saving}
              >
                تمت الطلبية
              </button>
            )}

            {order?.status === "processing" && (
              <button
                onClick={() => handleChangeStatus("completed")}
                className="px-6 py-2 bg-secondary-brown text-white rounded-md hover:bg-primary-brown font-medium"
                disabled={saving}
              >
                تأكيد الطلب
              </button>
            )}

            {order?.status === "completed" && (
              <button
                disabled
                className="px-6 py-2 bg-gray-200 text-gray-600 rounded-md font-medium cursor-not-allowed"
                title="الطلب مؤكد بالفعل"
              >
                تم التأكيد
              </button>
            )}
          </div>
        </div>
      </div>
    </ConditionalRender>
  );
}

/**
 * Renders a detailed list of discounts applied to the order.
 * Polished version with icons and premium styling.
 */
function DetailedDiscounts({ order }) {
  if (!order) return null;

  const discounts = [];

  // 1. General Order Discount
  if (parseFloat(order.applied_discount_value) > 0) {
    const val = parseFloat(order.applied_discount_value);
    const type = order.applied_discount_value_type || "fixed";
    let label = "خصم على إجمالي الطلب";
    if (order.applied_discount_type === "order_total") {
      label = "خصم على إجمالي الطلب"
    } else {
      label = "خصم على الكمية"
    };

    const valText = type === "percentage" ? `${val}%` : fmtMoney(val);

    discounts.push({
      id: "general",
      label: label,
      detail: valText,
      isPercentage: type === "percentage",
      isCalculated: type === "calculated",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      color: "blue"
    });
  }

  // 2. Payment Method Discount
  if (order.payment_method_discount) {
    const pmd = order.payment_method_discount;
    const val = parseFloat(pmd.value || 0);
    const type = pmd.value_type || "fixed";

    const valText = type === "percentage" ? `${val}%` : fmtMoney(val);

    discounts.push({
      id: "payment",
      label: pmd.name || "خصم طريقة الدفع",
      detail: valText,
      isPercentage: type === "percentage",
      isCalculated: type === "calculated",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "green"
    });
  }

  if (discounts.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">الخصومات المطبقة</div>
      <div className="grid gap-3">
        {discounts.map((d) => (
          <div
            key={d.id}
            className="group flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
          >
            {/* Background Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${d.color === "blue" ? "bg-blue-500" : "bg-green-500"} opacity-70`} />

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${d.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                {d.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">{d.label}</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {d.isPercentage ? "نظام النسبة المئوية" : d.isCalculated ? "قيمة محسوبة" : "قيمة ثابتة مخصومة"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-sm font-black ${d.color === "blue" ? "text-blue-600" : "text-green-600"}`}>
                {d.isPercentage ? "" : "-"} {d.detail}
              </span>
              <span className="text-[10px] text-green-500 font-bold bg-green-50 px-1.5 py-0.5 rounded-full">
                مطبق بنجاح
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
