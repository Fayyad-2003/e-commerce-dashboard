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
    const colorClass = isRead ? "text-gray-400" : type?.includes("Review") ? "text-blue-500" : "text-orange-500";
    if (type?.includes("Review")) return <MessageSquare size={16} className={colorClass} />;
    return <Bell size={16} className={colorClass} />;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="divide-y divide-gray-50">
        {items?.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="text-gray-200 mx-auto mb-3" size={40} />
            <p className="text-gray-400 text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          items.map((n) => {
            const isRead = !!n.read_at;
            const isReviewLink = n.data?.url?.startsWith("/admin/reviews") ?? false;
            const linkText = isReviewLink ? "عرض المراجعات" : "فتح الرابط";
            const href = isReviewLink ? "/admin/reviews?backUrl=/admin/notifications" : n.data.url;

            return (
              <div
                key={n.id}
                className={`group p-5 transition-colors duration-200 ${!isRead ? "bg-blue-50/30" : "bg-white hover:bg-gray-50/50"
                  }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="relative flex-shrink-0 mt-1">
                    <div className={`p-2.5 rounded-xl ${!isRead ? "bg-white border border-blue-100 shadow-sm" : "bg-gray-50 border border-transparent"}`}>
                      {getNotificationIcon(n.type, isRead)}
                    </div>
                    {!isRead && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <p className={`text-[14px] leading-relaxed transition-colors ${!isRead ? "text-gray-900 font-semibold" : "text-gray-500 font-normal"
                        }`}>
                        {n.data?.message ?? "—"}
                      </p>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-medium whitespace-nowrap">
                        <Calendar size={10} />
                        {formatDate(n.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-[11px]">
                      {n.data?.product_name && (
                        <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 flex items-center gap-1.5">
                          <Package size={12} className="opacity-50" />
                          <span>{n.data.product_name}</span>
                        </div>
                      )}
                      <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 flex items-center gap-1.5">
                        <Tag size={12} className="opacity-50" />
                        <span>
                          {n.type?.split("\\")[2] === "ProductReview" ? "مراجعة منتج" : (n.type?.split("\\")[2] ?? "عام")}
                        </span>
                      </div>

                      {n.data?.url && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          {linkText}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {!isRead && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => onMarkRead?.(n.id)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all active:scale-95"
                        >
                          <CheckCircle size={14} />
                          تعليم كمقروء
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
