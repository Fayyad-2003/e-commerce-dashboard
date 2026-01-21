import { Pagination } from "../common";
import { MessageSquare, Bell, ExternalLink, CheckCircle, Calendar, Package, Tag } from "lucide-react";

export default function NotificationsTable({
  items = [],
  pagination = {},
  reload,
  onPageChange,
  onPerPageChange,
  onMarkRead,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type, isRead) => {
    const colorClass = isRead ? "text-gray-300" : type?.includes("Review") ? "text-blue-500" : "text-orange-500";
    if (type?.includes("Review")) return <MessageSquare size={14} className={colorClass} />;
    return <Bell size={14} className={colorClass} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-100">
        {items?.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">لا توجد إشعارات</div>
        ) : (
          items.map((n) => {
            const isRead = !!n.read_at;
            const isReviewLink = n.data?.url?.startsWith("/admin/reviews") ?? false;
            const href = isReviewLink ? "/admin/reviews?backUrl=/admin/notifications" : n.data.url;
            return (
              <div key={n.id} className="p-4 relative">
                <div className="flex gap-3">
                  <div className="mt-1">{getNotificationIcon(n.type, isRead)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-relaxed ${!isRead ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {n.data?.message ?? "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(n.created_at)}</span>
                      {n.data?.product_name && <span className="flex items-center gap-1"><Package size={10} /> {n.data.product_name}</span>}
                    </div>
                  </div>
                  {!isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />}
                </div>
                <div className="mt-3 flex justify-end gap-3 items-center pt-3 border-t border-gray-50">
                  {n.data?.url && (
                    <a href={href} className="text-blue-600 text-[11px] font-medium flex items-center gap-1">
                      تفاصيل <ExternalLink size={10} />
                    </a>
                  )}
                  {!isRead && (
                    <button onClick={() => onMarkRead?.(n.id)} className="text-gray-400 hover:text-blue-600 text-[11px] font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> تعليم كمقروء
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">الإشعار</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">التاريخ</th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-[13px]">لا توجد إشعارات للعرض</td>
              </tr>
            ) : (
              items.map((n) => {
                const isRead = !!n.read_at;
                const isReviewLink = n.data?.url?.startsWith("/admin/reviews") ?? false;
                const href = isReviewLink ? "/admin/reviews?backUrl=/admin/notifications" : n.data.url;
                return (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {!isRead ? (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        ) : (
                          <div className="w-1.5 h-1.5" />
                        )}
                        <div className="opacity-60">{getNotificationIcon(n.type, isRead)}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-xl">
                        <p className={`text-[13px] leading-relaxed ${!isRead ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                          {n.data?.message ?? "—"}
                        </p>
                        {n.data?.product_name && (
                          <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
                            <Package size={10} className="opacity-50" />
                            <span>{n.data.product_name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[11px] text-gray-400">
                      {formatDate(n.created_at)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-4">
                        {n.data?.url && (
                          <a href={href} className="text-gray-400 hover:text-blue-600 transition-colors" title="التفاصيل">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {!isRead && (
                          <button
                            onClick={() => onMarkRead?.(n.id)}
                            className="text-gray-300 hover:text-blue-500 transition-colors"
                            title="تعليم كمقروء"
                          >
                            <CheckCircle size={16} />
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
