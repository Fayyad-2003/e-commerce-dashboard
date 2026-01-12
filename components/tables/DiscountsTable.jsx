"use client";
import Link from "next/link";
import { Pagination } from "../common";

export default function DiscountsTable({
  discounts = [],
  pagination = {},
  onDelete,
  onPageChange,
  onPerPageChange,
}) {

  const itemStartIndex = (Number(pagination.from ?? (discounts.length ? 1 : 0)) - 1) || 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">نوع القيمة</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الحد الأدنى للطلب</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تعديل</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">حذف</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {discounts.length > 0 ? (
              discounts.map((discount, index) => (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{itemStartIndex + index + 1}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{discount.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {discount.value_type === "fixed" ? `$${discount.value}` : `%${discount.value}`}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{discount.value_type === "fixed" ? "ثابت" : "نسبة مؤية"}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{discount.min_order_total} $</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {discount.type === "order_total" ? "خصم على كامل الطلب" : "طريقة الدفع"}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/discounts/${discount.id}/update`}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      تعديل
                    </Link>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onDelete?.(discount.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  لا توجد خصومات
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination المشترك */}
        <Pagination
          pagination={pagination}
          onPageChange={(n) => onPageChange?.(n)}
          onPerPageChange={(per) => onPerPageChange?.(per)}
          perPageOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
