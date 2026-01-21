"use client";
import { useMemo, useState } from "react";
import { Pagination } from "../common";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='sans-serif' font-size='20'>لا توجد صورة</text></svg>`
  );

const formatDate = (d) => {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
};

export default function ReviewsTable({
  comments = [],
  onApprove,
  onReject,
  pagination = {},
  onPageChange,
  onPerPageChange,
}) {
  const [expandedComment, setExpandedComment] = useState(null);
  const toggleExpand = (id) =>
    setExpandedComment(expandedComment === id ? null : id);

  const current = Number(pagination.current_page ?? 1);
  const last = Math.max(1, Number(pagination.last_page ?? 1));

  // مولّد الصفحات (مُذَكّر)
  const pages = useMemo(() => {
    const out = [];
    const max = Math.min(5, last);
    let start = Math.max(1, current - 2);
    let end = Math.min(last, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }, [current, last]);

  const statusBadge = (s) => {
    const st = s || "pending";
    if (st === "approved") return "bg-green-100 text-green-800";
    if (st === "rejected") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const statusText = (s) => {
    const st = s || "pending";
    if (st === "approved") return "مقبول";
    if (st === "rejected") return "مرفوض";
    return "قيد المراجعة";
  };

  // Normalize status from different shapes (is_approved as "1"/"0" or status string)
  // NOTE: treat "0"/false for is_approved as pending (not rejected) unless there's
  // an explicit is_rejected / status === 'rejected'
  const normalizeStatus = (c) => {
    // 1) explicit rejected flag from API (if available) — highest priority
    if (typeof c.is_rejected !== "undefined") {
      const rv = String(c.is_rejected).toLowerCase();
      if (rv === "1" || rv === "true") return "rejected";
      // explicit false -> continue to other checks
    }

    // 2) explicit approved flag
    if (typeof c.is_approved !== "undefined") {
      const val = String(c.is_approved).toLowerCase();
      if (val === "1" || val === "true") return "approved";
      // IMPORTANT: if is_approved is "0" or "false" we treat it as pending
      return "pending";
    }

    // 3) textual status field (strings like 'approved', 'rejected', 'pending', or localized)
    if (typeof c.status !== "undefined" && c.status !== null) {
      const s = String(c.status).trim().toLowerCase();
      if (s === "approved" || s === "مقبول" || s === "1") return "approved";
      if (s === "rejected" || s === "مرفوض" || s === "-1") return "rejected";
      return "pending";
    }

    // default fallback
    return "pending";
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* بطاقات للموبايل */}
      <div className="md:hidden space-y-4 p-4">
        {comments.map((c) => {
          const status = normalizeStatus(c);
          const reviewer = c.user?.name ?? "غير معروف";
          const productName = c.product?.name ?? "منتج غير معروف";
          const img =
            c.product?.full_image_urls?.[0] ??
            c.product?.images?.[0] ??
            PLACEHOLDER;
          return (
            <div key={String(c.id)} className="border rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <img
                  src={img}
                  alt={productName}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  className="w-16 h-16 object-cover rounded-md shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        المنتج: {productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        المراجع: {reviewer}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusBadge(
                        status
                      )}`}
                    >
                      {statusText(status)}
                    </span>
                  </div>

                  <div
                    className={`mt-2 text-gray-600 ${expandedComment === c.id ? "" : "line-clamp-2"
                      }`}
                    onClick={() => toggleExpand(c.id)}
                  >
                    {c.comment ?? c.text ?? "-"}
                  </div>

                  <div className="flex justify-between mt-4 pt-3 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove?.(c)}
                        disabled={status === "approved"}
                        className={`px-3 py-1 text-xs rounded ${status === "approved"
                          ? "bg-gray-100 text-gray-400"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => onReject?.(c)}
                        disabled={status === "rejected"}
                        className={`px-3 py-1 text-xs rounded ${status === "rejected"
                          ? "bg-gray-100 text-gray-400"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                      >
                        رفض
                      </button>
                    </div>
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="text-blue-600 text-xs"
                    >
                      {expandedComment === c.id ? "عرض أقل" : "عرض المزيد"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center text-gray-500">لا توجد تعليقات</div>
        )}
      </div>

      {/* جدول للديسكتوب */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                رقم المراجعة
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المراجع
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                المنتج
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                التعليق
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                التاريخ
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الحالة
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comments.map((c) => {
              const status = normalizeStatus(c);
              const reviewer = c.user?.name ?? "غير معروف";
              const productName = c.product?.name ?? "منتج غير معروف";
              const img =
                c.product?.full_image_urls?.[0] ??
                c.product?.images?.[0] ??
                PLACEHOLDER;

              return (
                <tr key={String(c.id)} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.id}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="text-gray-900 font-medium">{reviewer}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm max-w-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={productName}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        className="w-12 h-12 object-cover rounded-md shrink-0"
                      />
                      <div className="text-gray-700 truncate">
                        {productName}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                    <div
                      className={`${expandedComment === c.id ? "" : "line-clamp-2"
                        } cursor-pointer`}
                      onClick={() => toggleExpand(c.id)}
                    >
                      {c.comment ?? c.text ?? "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(c.created_at)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusBadge(
                        status
                      )}`}
                    >
                      {statusText(status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove?.(c)}
                        disabled={status === "approved"}
                        className={`text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 ${status === "approved"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        قبول
                      </button>

                      <button
                        onClick={() => onReject?.(c)}
                        disabled={status === "rejected"}
                        className={`px-3 py-1 text-xs rounded ${status === "rejected"
                          ? "bg-gray-100 text-gray-400"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                      >
                        رفض
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {comments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  لا توجد تعليقات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => onPerPageChange?.(per)}
        perPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
