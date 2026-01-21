"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchClient } from "../../../../lib/fetchClient";
import Link from "next/link";
import Image from "next/image"; // ✅ Next.js Image Component Import
import { ChevronDown, ChevronUp } from "lucide-react";
import { ConditionalRender } from "../../../../../components/common";
import toast from "react-hot-toast";
import { showConfirm } from "../../../../lib/confirm";

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

/**
 * Groups items by product ID.
 * If product is null (deleted), each item stays separate (grouped by item id).
 */
function groupProducts(items) {
  const groups = {};
  items.forEach((it) => {
    // If product is missing, use item id to keep it separate
    const productId = it.product?.id ? String(it.product.id) : `item-${it.id}`;
    if (!groups[productId]) {
      groups[productId] = {
        key: productId,
        product: it.product,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      };
    }
    groups[productId].items.push(it);
    groups[productId].totalQuantity += Number(it.quantity || 0);
    groups[productId].totalPrice +=
      Number(it.price_per_unit || 0) * Number(it.quantity || 0);
  });
  return Object.values(groups);
}

/**
 * Collapsible row for a group of product variants.
 */
function ProductGroupRow({
  group,
  getProductImage,
  availableColorsForSize,
  fmtMoney,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { product, items, totalQuantity, totalPrice } = group;
  const productExists = !!product;
  const title = productExists ? product.name : "منتج محذوف";
  const imgUrl = items.length > 0 ? getProductImage(items[0]) : null;

  const productHref =
    productExists && product.id
      ? product.store_section_id
        ? `/admin/store-products/${encodeURIComponent(String(product.id))}`
        : `/admin/products/${encodeURIComponent(String(product.id))}`
      : null;

  return (
    <div
      className={`group border rounded-2xl overflow-hidden bg-white transition-all duration-500 ${isExpanded ? "shadow-md border-gray-200" : "shadow-sm border-gray-100"
        }`}
    >
      {/* Header Row */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start p-5 gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-5 min-w-0 flex-1">
          <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center relative border border-gray-100 shadow-sm">
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={imgUrl.startsWith("http")}
              />
            ) : (
              <div className="text-xs text-gray-400">لا توجد صورة</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div className="font-bold text-[18px] text-gray-800 tracking-tight">
                {title}
              </div>
              {items.length > 1 && (
                <span className="bg-orange-50 text-orange-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-orange-100/50">
                  {items.length} خيارات
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400 font-medium">
              موديل: <span className="text-gray-600 font-semibold">{product?.model_number || "-"}</span>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="text-gray-500 bg-gray-50/80 px-3 py-1 rounded-lg border border-gray-100/50 flex items-center gap-2">
                <span>الكمية:</span>
                <span className="font-bold text-gray-900">{totalQuantity}</span>
              </div>
              <div className="text-gray-800 font-black text-lg">
                <span className="text-xs font-bold text-gray-400 ml-1">إجمالي:</span>
                {fmtMoney(totalPrice)} $
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className={`p-2.5 rounded-xl transition-all duration-500 ${isExpanded ? "bg-[var(--primary-brown)] text-white rotate-180" : "bg-gray-50 text-gray-400 border border-gray-100"
            }`}>
            <ChevronDown size={20} className="transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* Expanded Content Wrapper (Grid technique for height animation) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? "grid-template-rows-[1fr] opacity-100" : "grid-template-rows-[0fr] opacity-0"
        }`} style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="bg-[#fcfcfc] border-t border-gray-50 divide-y divide-gray-100/50">
            <div className="px-5 py-3 bg-gray-50/30 text-[11px] font-bold text-gray-400 uppercase tracking-widest flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                تفاصيل المتغيرات المشتراة
              </span>
              {items.length > 1 && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-100">{items.length} عناصر</span>}
            </div>
            {items.map((it) => {
              const selectedSize = it.size;
              const selectedColor = it.color;
              const availableColors = it.product
                ? availableColorsForSize(it.product, selectedSize)
                : [];

              return (
                <div
                  key={it.id}
                  className="p-5 flex flex-col sm:flex-row justify-between items-center gap-6 hover:bg-white transition-colors"
                >
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <div className="flex flex-wrap gap-3">
                      {selectedSize && (
                        <div className="bg-white px-3.5 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5 group/tag hover:border-blue-100 transition-colors">
                          <span className="text-gray-400 text-[11px] font-bold group-hover/tag:text-blue-400 transition-colors">المقاس</span>
                          <span className="font-bold text-gray-700">
                            {selectedSize}
                          </span>
                        </div>
                      )}
                      {selectedColor && (
                        <div className="bg-white px-3.5 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5 group/tag hover:border-green-100 transition-colors">
                          <span className="text-gray-400 text-[11px] font-bold group-hover/tag:text-green-400 transition-colors">اللون</span>
                          <span className="font-bold text-gray-700">
                            {selectedColor}
                          </span>
                        </div>
                      )}
                    </div>
                    {it.notes && (
                      <div className="text-xs text-orange-600 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/30 flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="leading-relaxed">ملاحظة: {it.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-10 text-sm w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-center sm:text-right">
                      <div className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">
                        سعر الوحدة
                      </div>
                      <div className="font-semibold text-gray-600">
                        {fmtMoney(it.price_per_unit)}
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">
                        الكمية
                      </div>
                      <div className="font-black text-gray-800 bg-gray-100/50 px-2.5 py-1 rounded-lg">
                        {it.quantity}
                      </div>
                    </div>
                    <div className="text-right min-w-[110px]">
                      <div className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">
                        المجموع الفرعي
                      </div>
                      <div className="font-black text-gray-900 text-base">
                        {fmtMoney(
                          Number(it.price_per_unit) * Number(it.quantity)
                        )} $
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {productHref && (
              <div className="px-5 py-4 bg-gray-50/30 text-center border-t border-gray-100/50">
                <Link
                  href={productHref}
                  className="text-[11px] text-blue-500 hover:text-blue-700 transition-colors font-bold uppercase tracking-wider inline-flex items-center gap-2 group/link"
                >
                  انتقل إلى تفاصيل المنتج
                  <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
    const ok = await showConfirm({
      title: "تحديث الحالة",
      text: `هل أنت متأكد من تغيير حالة الطلب إلى "${STATUS_MAP[newStatus]?.label || newStatus}"؟`,
      confirmButtonText: "نعم، متأكد",
      icon: "question"
    });
    if (!ok) return;
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
      toast.error(`تعذر تحديث الحالة: ${err?.message || err}`);
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

            <div className="space-y-4">
              {products.length ? (
                groupProducts(products).map((group) => (
                  <ProductGroupRow
                    key={group.key}
                    group={group}
                    getProductImage={getProductImage}
                    availableColorsForSize={availableColorsForSize}
                    fmtMoney={fmtMoney}
                  />
                ))
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
