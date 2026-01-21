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

  const getNotificationIcon = (type) => {
    if (type?.includes("Review")) return <MessageSquare size={18} className="text-blue-500" />;
    return <Bell size={18} className="text-orange-500" />;
  };

  return (
    <div className="bg-[#fcfaf8]/50 rounded-3xl overflow-hidden border border-gray-100/50 shadow-sm">
      <div className="divide-y divide-gray-100/80">
        {items?.length === 0 ? (
          <div className="p-12 text-center bg-white/50 backdrop-blur-sm">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">لا توجد إشعارات حالياً</p>
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
                className={`group relative p-6 transition-all duration-300 border-l-4 ${!isRead
                    ? "bg-white border-blue-500 shadow-sm"
                    : "bg-white/40 border-transparent hover:bg-white/80"
                  }`}
              >
                {!isRead && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">جديد</span>
                  </div>
                )}

                <div className="flex gap-5 items-start">
                  <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${!isRead ? "bg-blue-50" : "bg-gray-100/50"
                    }`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <h3 className={`text-[15px] leading-relaxed transition-colors ${!isRead ? "text-gray-900 font-bold" : "text-gray-600 font-medium"
                        }`}>
                        {n.data?.message ?? "—"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold whitespace-nowrap bg-gray-50/50 px-2.5 py-1 rounded-full border border-gray-100/50">
                        <Calendar size={12} />
                        {formatDate(n.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center text-[12px]">
                      {n.data?.product_name && (
                        <div className="bg-blue-50/50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100/30 flex items-center gap-2 group/tag hover:bg-blue-50 transition-colors">
                          <Package size={14} className="opacity-60" />
                          <span className="font-bold">المنتج: <span className="text-blue-900">{n.data.product_name}</span></span>
                        </div>
                      )}
                      <div className="bg-orange-50/50 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-100/30 flex items-center gap-2 group/tag hover:bg-orange-50 transition-colors">
                        <Tag size={14} className="opacity-60" />
                        <span className="font-bold">
                          {n.type?.split("\\")[2] === "ProductReview" ? "مراجعة منتج" : (n.type?.split("\\")[2] ?? "عام")}
                        </span>
                      </div>

                      {n.data?.url && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-black px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                        >
                          {linkText}
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {!isRead && (
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => onMarkRead?.(n.id)}
                          className="flex items-center gap-2 bg-gray-900 text-white text-[12px] font-bold px-5 py-2.5 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
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

      <div className="p-4 bg-white/50 border-t border-gray-100/80 backdrop-blur-sm">
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
