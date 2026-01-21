import { Pagination } from "../common";
import { MessageSquare, Bell, Calendar, Package, CheckCircle } from "lucide-react";
import { parseNotification } from "@/lib/notifications";

export default function NotificationsTable({
  items = [],
  pagination = {},
  onPageChange,
  onPerPageChange,
  onMarkRead,
}) {
  const getNotificationIcon = (type, isRead) => {
    const colorClass = isRead ? "text-gray-300" : type?.includes("Review") ? "text-[#F7931D]" : "text-[#F7931D]";
    if (type?.includes("Review")) return <MessageSquare size={16} className={colorClass} />;
    return <Bell size={16} className={colorClass} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-100">
        {items?.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">لا توجد إشعارات</div>
        ) : (
          items.map((item) => {
            const n = parseNotification(item);
            return (
              <div key={n.id} className="p-5 relative">
                <div className="flex gap-4">
                  <div className="mt-1">{getNotificationIcon(n.type, n.isRead)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.isRead ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {n.createdAt}</span>
                      {n.productName && <span className="flex items-center gap-1.5"><Package size={12} /> {n.productName}</span>}
                    </div>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-[#F7931D] rounded-full shrink-0" />}
                </div>
                <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex gap-3">
                    {n.href !== "#" && (
                      <a href={n.href} className="text-[#F7931D] hover:underline text-xs font-semibold">
                        {n.linkText}
                      </a>
                    )}
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => onMarkRead?.(n.id)}
                      className="text-emerald-500 hover:text-emerald-600 transition-colors"
                      title="تعليم كمقروء"
                    >
                      <CheckCircle size={22} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإشعار</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">لا توجد إشعارات للعرض</td>
              </tr>
            ) : (
              items.map((item) => {
                const n = parseNotification(item);
                return (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {!n.isRead ? (
                          <span className="w-2 h-2 bg-[#F7931D] rounded-full" />
                        ) : (
                          <div className="w-2 h-2" />
                        )}
                        <div className="opacity-70">{getNotificationIcon(n.type, n.isRead)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-2xl">
                        <p className={`text-sm leading-relaxed ${!n.isRead ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                          {n.message}
                        </p>
                        {n.productName && (
                          <div className="mt-1.5 text-xs text-gray-400 flex items-center gap-1.5">
                            <Package size={12} className="opacity-60" />
                            <span>{n.productName}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-xs text-gray-400">
                      {n.createdAt}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-6">
                        {n.href !== "#" && (
                          <a href={n.href} className="text-[#F7931D] hover:underline text-xs font-bold transition-colors">
                            {n.linkText}
                          </a>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => onMarkRead?.(n.id)}
                            className="text-emerald-500 hover:text-emerald-600 transition-colors"
                            title="تعليم كمقروء"
                          >
                            <CheckCircle size={22} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          perPageOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
