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
    if (type?.includes("Review")) return <MessageSquare size={16} className={colorClass} />;
    return <Bell size={16} className={colorClass} />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Mobile View: Cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {items?.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="text-gray-200 mx-auto mb-3" size={40} />
            <p className="text-gray-400 text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          items.map((n) => {
            const isRead = !!n.read_at;
            const isReviewLink = n.data?.url?.startsWith("/admin/reviews") ?? false;
            const href = isReviewLink ? "/admin/reviews?backUrl=/admin/notifications" : n.data.url;
            return (
              <div key={n.id} className={`p-4 ${!isRead ? "bg-blue-50/20" : "bg-white"}`}>
                <div className="flex gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${!isRead ? "bg-white border border-blue-50 shadow-sm" : "bg-gray-50"}`}>
                    {getNotificationIcon(n.type, isRead)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!isRead ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                      {n.data?.message ?? "—"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {n.data?.product_name && (
                    <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                      <Package size={10} className="opacity-40" /> {n.data.product_name}
                    </span>
                  )}
                  <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1">
                    <Tag size={10} className="opacity-40" />
                    {n.type?.split("\\")[2] === "ProductReview" ? "مراجعة منتج" : (n.type?.split("\\")[2] ?? "عام")}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-50">
                  {n.data?.url && (
                    <a href={href} className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                      عرض <ExternalLink size={12} />
                    </a>
                  )}
                  {!isRead && (
                    <button onClick={() => onMarkRead?.(n.id)} className="text-blue-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> تعليم كمقروء
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإشعار</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {items?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">لا توجد إشعارات</td>
              </tr>
            ) : (
              items.map((n) => {
                const isRead = !!n.read_at;
                const isReviewLink = n.data?.url?.startsWith("/admin/reviews") ?? false;
                const href = isReviewLink ? "/admin/reviews?backUrl=/admin/notifications" : n.data.url;
                return (
                  <tr key={n.id} className={`hover:bg-gray-50/50 transition-colors ${!isRead ? "bg-blue-50/10" : "bg-white"}`}>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${!isRead ? "bg-white border border-blue-50 shadow-sm" : "bg-gray-50 text-gray-300"}`}>
                          {getNotificationIcon(n.type, isRead)}
                        </div>
                        <span className={`text-xs font-medium ${!isRead ? "text-gray-900" : "text-gray-500"}`}>
                          {n.type?.split("\\")[2] === "ProductReview" ? "مراجعة منتج" : (n.type?.split("\\")[2] ?? "عام")}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-md">
                        <p className={`text-sm leading-relaxed ${!isRead ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                          {n.data?.message ?? "—"}
                        </p>
                        {n.data?.product_name && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                            <Package size={10} />
                            <span>المنتج: {n.data.product_name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                      {formatDate(n.created_at)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {n.data?.url && (
                          <a href={href} className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {!isRead && (
                          <button onClick={() => onMarkRead?.(n.id)} className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1" title="تعليم كمقروء">
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
