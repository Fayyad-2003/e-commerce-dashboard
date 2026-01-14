"use client";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { Pagination } from "../common";
import { fetchClient } from "../../src/lib/fetchClient";

// simple absolute-URL check
const isAbsoluteUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

function getImageSrc(item) {
  const base = process.env.NEXT_PUBLIC_IMAGES;
  // prefer explicit fields in order
  const candidate =
    item?.image ??
    item?.images?.[0] ??
    item?.full_image_urls?.[0] ??
    item?.full_image_url ??
    null;

  if (!candidate) return "/placeholder.png";

  // if candidate already an absolute url, return it untouched
  if (isAbsoluteUrl(candidate) || candidate.startsWith("//")) {
    return candidate;
  }

  // candidate is relative (maybe starts with / or not) — attach base if provided
  if (base) {
    // ensure there's exactly one slash between base and candidate
    return candidate.startsWith("/")
      ? `${base}${candidate}`
      : `${base}/${candidate}`;
  }

  // no base configured, return candidate (likely '/storage/...' or 'images/..')
  return candidate.startsWith("/") ? candidate : `/${candidate}`;
}

export default function Table({
  data = [],
  pagination = {},
  categorie = "",
  sub = "",
  url = "",
  editHref,
  deleteHref,
  deleteLabel = "هذا العنصر",
  onDelete,
  onPageChange,
  onPerPageChange,
  subCol,
  isProduct, // explicit override
}) {
  const safeData = Array.isArray(data) ? data : [];
  const priorities = useRef({});

  // Detect if this is a product list by checking for a 'description' field
  const isProductTable = useMemo(() => {
    if (typeof isProduct === "boolean") return isProduct;
    const first = safeData[0];
    return first && typeof first === "object" && "description" in first;
  }, [safeData, isProduct]);

  // Helper: are we rendering "main branches" table? (i.e. it should show a link to sub-branches)
  // This is true when a non-null sub label is provided (and we're NOT in a product table)
  const showSubCol = useMemo(() => {
    return !!sub && sub !== "null" && !isProductTable;
  }, [sub, isProductTable]);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingPriorityId, setUpdatingPriorityId] = useState(null);

  async function handlePriorityUpdate(item, newPriority) {
    const id = item?.id;
    if (!id) return;

    try {
      setUpdatingPriorityId(id);

      const data = new FormData();
      data.append("name", item.name || "");
      data.append("description", item.description || "");
      data.append("model_number", item.model_number || "");
      data.append("store_section_id", item.store_section_id || item.sub_category_id || "");
      data.append("unit_of_measure_id", item.unit_of_measure_id || "");
      data.append("base_price", item.base_price || item.basePrice || "");
      data.append("priority", Number(newPriority));
      data.append("_method", "POST");

      const res = await fetchClient(`/api/products/${id}`, {
        method: "POST",
        body: data,
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out?.success === false) {
        alert(out?.message || "فشل تحديث الأولوية");
      } else {
        alert("تم تحديث الأولوية بنجاح");
      }
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
    } finally {
      setUpdatingPriorityId(null);
    }
  }

  const getEditHref = (item) => {
    if (!editHref) return null;
    if (typeof editHref === "function") {
      const out = editHref(item);
      if (!out || /(undefined|null|NaN)(\/)?$/.test(String(out))) return null;
      return out;
    }
    if (!item?.id && item?.id !== 0) return null;
    return `${editHref.replace(/\/+$/, "")}/${item.id}`;
  };

  const getDeleteHref = (item) => {
    if (!deleteHref)
      return item?.id != null ? `/api/products/${item.id}` : null;
    if (typeof deleteHref === "function") {
      const out = deleteHref(item);
      if (!out || /(undefined|null|NaN)(\/)?$/.test(String(out))) return null;
      return out;
    }
    if (!item?.id && item?.id !== 0) return null;
    return `${deleteHref.replace(/\/+$/, "")}/${item.id}`;
  };

  async function internalDelete(item) {
    const id = item?.id;
    const target = getDeleteHref(item);
    if (!id || !target) return;

    const ok = window.confirm(
      `هل أنت متأكد من حذف ${deleteLabel}؟ لا يمكن التراجع.`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await fetchClient(target, { method: "DELETE" });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out?.success === false) {
        alert(out?.message || `فشل الحذف (HTTP ${res.status})`);
        return;
      }
      alert(out?.message || "تم الحذف");
    } catch (e) {
      alert(`خطأ: ${e?.message || e}`);
    } finally {
      setDeletingId(null);
    }
  }

  const computeColSpan = () => {
    // Base columns:
    // possible product id, image, model_number, main title, details, sub/go, products, edit, delete
    let cols = 0;
    if (isProductTable) cols += 1; // id
    cols += 1; // image
    if (isProductTable) cols += 1; // model_number
    cols += 1; // main title (categorie)
    if (isProductTable) cols += 1; // details link
    if (showSubCol) cols += 1; // show sub/visit link
    if (subCol === "products") cols += 1; // show products link (for sub-branches)
    if (isProductTable) cols += 1; // priority
    cols += 1; // edit
    cols += 1; // delete
    return cols || 1;
  };

  const makeHref = (id) => {
    if (id == null) return "#";
    const base = url || "";
    // If it's a product link, we might need a different base? 
    // But usually the 'url' prop is passed correctly from the parent.
    return `${base.replace(/\/+$/, "")}/${id}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      {/* mobile */}
      <div className="md:hidden space-y-4 p-4">
        {safeData.map((item, index) => (
          <div
            key={item?.id ?? index}
            className="border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={getImageSrc(item)}
                  alt={item?.name ?? "item"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 64px"
                  unoptimized={
                    getImageSrc(item) === "/placeholder.png" ? true : false
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {item?.name ?? "-"}
                </h3>
                {item?.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item?.category?.name && (
                  <p className="text-[10px] text-[var(--primary-brown)] mt-0.5 font-medium">
                    التصنيف: {item.category.name}
                  </p>
                )}
                {isProductTable && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-500">رقم الموديل: {item?.model_number ?? "—"}</p>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        defaultValue={item.priority ?? 0}
                        onChange={(e) => (priorities.current[item.id] = e.target.value)}
                        className={`w-14 h-7 px-1 text-xs border rounded text-center focus:ring-1 focus:ring-[var(--primary-brown)] outline-none ${updatingPriorityId === item.id ? "opacity-50" : ""}`}
                        disabled={updatingPriorityId === item.id}
                      />
                      <button
                        onClick={() => handlePriorityUpdate(item, priorities.current[item.id] ?? item.priority)}
                        disabled={updatingPriorityId === item.id}
                        className="bg-green-600 text-white p-1 rounded hover:bg-green-700 disabled:opacity-50"
                        title="حفظ الأولوية"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {isProductTable && (
                <>
                  <div className="text-sm">
                    <span className="font-medium">الفئة:</span>{" "}
                    {typeof item?.category === "object" ? item?.category?.name : item?.category ?? "—"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">السعر:</span>{" "}
                    {item?.basePrice ?? "—"} $
                  </div>
                </>
              )}

              {showSubCol && (
                <Link href={makeHref(item?.id)} className="block">
                  <span className="text-[var(--primary-brown)] hover:text-[var(--primary-orange)] text-sm">
                    {/** when showing sub column from main branches: label is the 'sub' prop */}
                    {isProductTable
                      ? "ذهاب"
                      : typeof sub === "string"
                        ? sub
                        : "عرض"}
                  </span>
                </Link>
              )}

              {subCol === "products" && (
                <Link
                  href={`/admin/products/sub-branch-products/${item.id}`}
                  className="block"
                >
                  <span className="text-[var(--primary-brown)] hover:text-[var(--primary-orange)] text-sm">
                    عرض المنتجات
                  </span>
                </Link>
              )}

              <div className="flex justify-between pt-2">
                {(() => {
                  const href = getEditHref(item);
                  return href ? (
                    <Link
                      href={href}
                      className="text-[var(--primary-orange)] hover:text-[var(--secondary-brown)] text-sm"
                      role="button"
                    >
                      تعديل
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm cursor-not-allowed">
                      تعديل
                    </span>
                  );
                })()}

                <button
                  onClick={() =>
                    onDelete ? onDelete(item.id) : internalDelete(item)
                  }
                  disabled={deletingId === item?.id}
                  className={`text-sm ${deletingId === item?.id
                    ? "text-gray-400 cursor-wait"
                    : "text-red-600 hover:text-red-900"
                    }`}
                >
                  {deletingId === item?.id ? "جارٍ الحذف..." : "حذف"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {safeData.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-6">
            لا توجد بيانات للعرض.
          </div>
        )}
      </div>

      {/* desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isProductTable && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  المعرف
                </th>
              )}
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصورة
              </th>
              {isProductTable && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  رقم الموديل
                </th>
              )}
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {categorie}
              </th>
              {isProductTable && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  التفاصيل
                </th>
              )}
              {showSubCol && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {sub}
                </th>
              )}
              {subCol === "products" && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  عرض المنتجات
                </th>
              )}
              {isProductTable && (
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  الأولوية
                </th>
              )}
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                التعديل
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                الحذف
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((item, index) => (
              <tr key={item?.id ?? index} className="hover:bg-gray-50">
                {isProductTable && (
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap text-center">
                    {item?.id}
                  </td>
                )}
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex justify-center">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                      <Image
                        src={getImageSrc(item)}
                        alt={item?.name ?? "item"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50px, 50px"
                        unoptimized={
                          getImageSrc(item) === "/placeholder.png"
                            ? true
                            : false
                        }
                      />
                    </div>
                  </div>
                </td>

                {isProductTable && (
                  <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap text-center">
                    {item?.model_number ?? "—"}
                  </td>
                )}

                <td className="px-3 py-4 text-sm text-gray-900 max-w-md text-right">
                  <div className="font-semibold text-gray-800">{item?.name ?? "—"}</div>
                  {item?.description && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </div>
                  )}
                  {item?.category?.name && (
                    <div className="text-[10px] text-[var(--primary-brown)] mt-1 font-medium bg-gray-50 px-2 py-0.5 rounded-full w-fit">
                      {item.category.name}
                    </div>
                  )}
                </td>

                {isProductTable && (
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <Link href={`/admin/products/${item?.id}`}>
                      <span className="text-[var(--primary-brown)] hover:text-[var(--primary-orange)] cursor-pointer">
                        تفاصيل
                      </span>
                    </Link>
                  </td>
                )}

                {showSubCol && (
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <Link href={makeHref(item?.id)}>
                      <span className="text-[var(--primary-brown)] hover:text-[var(--primary-orange)] cursor-pointer">
                        {isProductTable ? "ذهاب" : "ذهاب"}
                      </span>
                    </Link>
                  </td>
                )}

                {subCol === "products" && (
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <Link
                      href={`/admin/products/sub-branch-products/${item.id}?mainCategoryId=${item?.category_id}`}
                    >
                      <span className="text-[var(--primary-brown)] hover:text-[var(--primary-orange)] cursor-pointer">
                        عرض المنتجات
                      </span>
                    </Link>
                  </td>
                )}

                {isProductTable && (
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center gap-1 w-24 mx-auto">
                      <input
                        type="number"
                        defaultValue={item.priority ?? 0}
                        onChange={(e) => (priorities.current[item.id] = e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePriorityUpdate(item, priorities.current[item.id] ?? item.priority);
                          }
                        }}
                        className={`w-14 h-8 px-2 border rounded text-center focus:ring-1 focus:ring-[var(--primary-brown)] outline-none transition-all ${updatingPriorityId === item.id ? "bg-gray-100 animate-pulse" : ""}`}
                        disabled={updatingPriorityId === item.id}
                      />
                      <button
                        onClick={() => handlePriorityUpdate(item, priorities.current[item.id] ?? item.priority)}
                        disabled={updatingPriorityId === item.id}
                        className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        title="حفظ الأولوية"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-center">
                  {(() => {
                    const href = getEditHref(item);
                    return href ? (
                      <Link
                        href={href}
                        className="text-[var(--primary-orange)] hover:text-[var(--secondary-brown)] cursor-pointer"
                      >
                        تعديل
                      </Link>
                    ) : (
                      <span className="text-gray-400 cursor-not-allowed">
                        تعديل
                      </span>
                    );
                  })()}
                </td>

                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <button
                    onClick={() =>
                      onDelete ? onDelete(item.id) : internalDelete(item)
                    }
                    disabled={deletingId === item?.id}
                    className={`cursor-pointer ${deletingId === item?.id
                      ? "text-gray-400"
                      : "text-red-600 hover:text-red-900"
                      }`}
                  >
                    {deletingId === item?.id ? "جارٍ الحذف..." : "حذف"}
                  </button>
                </td>
              </tr>
            ))}

            {safeData.length === 0 && (
              <tr>
                <td
                  className="px-3 py-6 text-center text-sm text-gray-500"
                  colSpan={computeColSpan()}
                >
                  لا توجد بيانات للعرض.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => onPerPageChange?.(per)}
        perPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
