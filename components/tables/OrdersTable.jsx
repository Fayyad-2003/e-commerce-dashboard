// "use client";
import Link from "next/link";
import { Pagination } from "../common";
import { Archive, Trash2 } from "lucide-react";

export default function OrdersTable({
  orders = [],
  onUpdateStatus,
  onDelete,
  onToggleArchive,
  pagination,
  onPageChange,
  onPerPageChange,
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">أرشفة</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلبية</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العميل</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ الإجمالي</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200" dir="rtl">
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => onToggleArchive?.(order.id)}
                    className={`transition-colors ${order.is_archived ? "text-orange-600 hover:text-orange-800" : "text-gray-400 hover:text-orange-600"}`}
                    title={order.is_archived ? "إلغاء الأرشفة" : "أرشفة الطلبية"}
                  >
                    <Archive className="w-5 h-5 mx-auto" />
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderNumber}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.user?.name || "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.date || "—"}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${order.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                    {order.status === "completed" ? "منتهية" : "قيد المعالجة"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Number(order.total || 0).toFixed(2)} $
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      التفاصيل
                    </Link>
                    <button
                      onClick={() => onDelete?.(order.id)}
                      className="text-red-600 hover:text-red-800"
                      title="حذف الطلبية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">لا توجد طلبيات</td></tr>
          )}
        </tbody>

      </table>

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  );
}
