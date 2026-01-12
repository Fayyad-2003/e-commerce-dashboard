"use client";
import Link from "next/link";
import { Pagination } from "../common";

function fmt(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
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

export default function ArticlesTable({
  articles = [],
  pagination = {},
  onDelete,
  onPageChange,
  onPerPageChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Image column */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
              صورة
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              العنوان
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              التاريخ
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              تفاصيل
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              تعديل
            </th>

            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              حذف
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-50">
              {/* Image cell */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center justify-center">
                  <Link href={`/admin/articles/${article.id}`}>
                    {article.full_image_url ? (
                      <img
                        src={article.full_image_url}
                        alt={article.title || "article image"}
                        className="w-16 h-10 sm:w-20 sm:h-12 rounded object-cover border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-10 sm:w-20 sm:h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border">
                        لا صورة
                      </div>
                    )}
                  </Link>
                </div>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {article.title || "-"}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {fmt(article.created_at)}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  عرض
                </Link>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  تعديل
                </Link>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDelete?.(article.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}

          {articles.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                لا توجد مقالات
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination component */}
      <Pagination
        pagination={pagination}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => {
          // onPerPageChange expects per (number)
          onPerPageChange?.(per);
        }}
        perPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
