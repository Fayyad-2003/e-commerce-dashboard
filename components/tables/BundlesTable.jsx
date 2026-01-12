"use client";
import Link from "next/link";
import { Pagination } from "../common";

export default function BundlesTable({
  bundles = [],
  pagination = {}, // { total, per_page, current_page, last_page, from, to }
  onDelete,
  onPageChange, // (n) => void
  onPerPageChange // (per) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي المنتجات</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">تعديل</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">حذف</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {bundles.map((offer) => (
            <tr key={offer.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                {offer.img ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGES}/${offer.img}`}
                    alt={offer.name}
                    className="w-12 h-12 rounded object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 border flex items-center justify-center text-gray-400 text-xs">
                    لا يوجد
                  </div>
                )}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {offer.name || "-"}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {offer.price} $
              </td>

              {/* Sum the quantities from the pivot object */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {offer.products?.reduce((total, product) => total + (parseInt(product.pivot?.quantity) || 0), 0) ?? 0}
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/admin/bundles/${offer?.id}/update`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  تعديل
                </Link>
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onDelete?.(offer)}
                  className="text-red-600 hover:text-red-900"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}

          {bundles.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                لا توجد عروض
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination (shared component) */}
      <Pagination
        pagination={pagination}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => onPerPageChange?.(per)}
        perPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
