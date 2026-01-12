"use client";
import React from "react";
import { Pagination } from "../common";

export default function ReportsTable({
  data = [],
  columns = [],
  title = "",
  pagination = null,
  onPageChange,
  onPerPageChange,
}) {
  const rows = Array.isArray(data) ? data : [];
  const pag = pagination ?? {};

  // Helper: safe get first element
  const first = rows.length ? rows[0] : null;

  // Build automatic columns when none were passed in
  const autoColumns = React.useMemo(() => {
    if (columns && columns.length) return columns;

    // Generic details renderer (collapsible JSON)
    const Details = ({ item }) => (
      <details className="text-sm">
        <summary className="cursor-pointer underline">تفاصيل</summary>
        <pre className="mt-2 whitespace-pre-wrap text-xs rounded bg-gray-50 p-3 border">{JSON.stringify(item, null, 2)}</pre>
      </details>
    );

    // Product-type report
    if (first && first.product) {
      return [
        {
          header: "#",
          accessor: (item, i) => <span>{i + 1}</span>,
          className: "text-gray-600",
        },
        {
          header: "المنتج",
          accessor: (item) => {
            const p = item.product || {};
            const img = (p.full_image_urls && p.full_image_urls[0]) || (p.images && p.images[0]) || null;
            return (
              <div className="flex items-center gap-3">
                {img ? (
                  // assume absolute url when full_image_urls present
                  <img
                    src={img}
                    alt={p.name}
                    className="h-12 w-12 object-cover rounded"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs">لا صورة</div>
                )}
                <div className="text-right">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">ID: {p.id}</div>
                </div>
              </div>
            );
          },
        },
        {
          header: "الكمية المباعة",
          accessor: (item) => <span>{item.total_quantity_sold ?? "-"}</span>,
        },
        {
          header: "تاريخ آخر بيع",
          accessor: (item) => {
            if (!item.last_sold_date) return <span>-</span>;
            try {
              return <span>{new Date(item.last_sold_date).toLocaleString("en-US")}</span>;
            } catch {
              return <span>{item.last_sold_date}</span>;
            }
          },
        },
        {
          header: "سعر المنتَج الأساسي",
          accessor: (item) => <span>{item.product?.base_price ?? "-"}</span>,
        },
        {
          header: "التقييمات المعتمدة",
          accessor: (item) => {
            const reviews = item.product?.approved_reviews || [];
            return (
              <div className="text-right">
                <div className="font-medium">{reviews.length} تعليق</div>
                {reviews.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                    {reviews.map((r) => (
                      <li key={r.id} title={r.created_at} className="truncate max-w-xs">
                        {r.comment}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          },
        },
        {
          header: "البيانات الكاملة",
          accessor: (item) => <Details item={item} />,
        },
      ];
    }

    // User-type report
    if (first && first.user) {
      return [
        {
          header: "#",
          accessor: (item, i) => <span>{i + 1}</span>,
        },
        {
          header: "المستخدم",
          accessor: (item) => {
            const u = item.user || {};
            return (
              <div className="text-right">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email} — ID: {u.id}</div>
              </div>
            );
          },
        },
        {
          header: "الإجمالي المصروف",
          accessor: (item) => <span>{item.total_spent ?? "-"}</span>,
        },
        {
          header: "عدد الطلبات",
          accessor: (item) => <span>{item.total_orders ?? "-"}</span>,
        },
        {
          header: "البيانات الكاملة",
          accessor: (item) => <details className="text-sm"><summary className="cursor-pointer underline">تفاصيل</summary><pre className="mt-2 whitespace-pre-wrap text-xs rounded bg-gray-50 p-3 border">{JSON.stringify(item, null, 2)}</pre></details>,
        },
      ];
    }

    // Fallback: render keys + full JSON
    return [
      {
        header: "#",
        accessor: (item, i) => <span>{i + 1}</span>,
      },
      {
        header: "البيانات",
        accessor: (item) => (
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
        ),
      },
    ];
  }, [columns, first]);

  const effectiveColumns = autoColumns;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {effectiveColumns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((item, i) => (
              <tr key={String(item.id ?? item.product?.id ?? item.user?.id ?? i)} className="hover:bg-gray-50">
                {effectiveColumns.map((col, j) => (
                  <td
                    key={j}
                    className={`px-4 py-4 whitespace-nowrap text-sm ${col.className || "text-gray-500"}`}
                  >
                    {col.accessor ? col.accessor(item, i) : "-"}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={effectiveColumns.length} className="px-4 py-6 text-center text-gray-500">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        pagination={pag}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => onPerPageChange?.(per)}
        perPageOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
