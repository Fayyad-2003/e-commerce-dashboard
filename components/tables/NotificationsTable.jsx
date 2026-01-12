"use client";
import { useNotifications as useNotificationsContext } from "../../context/NotificationsContext"; // حافظنا على السياق الأصلي
import { Pagination } from "../common";
import { fetchClient } from "../../src/lib/fetchClient";

export default function NotificationsTable({
  items = [],
  pagination = {},
  reload, // دالة لإعادة الجلب (من الهُوك)
  onPageChange, // دالة تغيير الصفحة (من الهُوك)
  onPerPageChange, // دالة تغيير per_page (من الهُوك)
}) {
  const { updateUnreadCount } = useNotificationsContext();

  const handleMarkRead = async (notificationId) => {
    try {
      const res = await fetchClient(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));
      if (!data.success)
        throw new Error(data.message || "فشل وسم الإشعار كمقروء");

      // خصم عداد الاشعارات غير المقروءة
      if (typeof updateUnreadCount === "function") updateUnreadCount(-1);

      // أعد تحميل البيانات من الباكند
      if (typeof reload === "function") await reload();
    } catch (err) {
      console.error(err);
      alert(err.message || "حدث خطأ أثناء تحديث الإشعار");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items?.length === 0 ? (
          <div className="p-6 text-center text-gray-500">لا توجد إشعارات</div>
        ) : (
          items.map((n) => {
            const isReviewLink =
              n.data?.url?.startsWith("/admin/reviews") ?? false;
            const linkText = isReviewLink
              ? "اذهب إلى المراجعات"
              : "افتح الرابط";

            // 1. Define the dynamic URL with the backUrl parameter
            // Ensure '/admin/notifications' matches your actual Notifications page route
            const href = isReviewLink
              ? "/admin/reviews?backUrl=/admin/notifications"
              : n.data.url;

            return (
              <div
                key={n.id}
                className={`p-4 transition-all ${!n.read_at ? "bg-gray-50 font-semibold" : "bg-white"
                  } hover:bg-gray-100`}
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-800 text-sm sm:text-base">
                    {n.data?.message ?? "—"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(n.created_at)}
                  </span>
                </div>

                {/* تم حذف عرض اسم المراجع (n.data?.reviewer_name) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                  {/* <div className="sm:col-span-1"><span className="text-gray-500">المراجع:</span> {n.data?.reviewer_name ?? "—"}</div> */}
                  <div>
                    <span className="text-gray-500">المنتج:</span>{" "}
                    {n.data?.product_name ?? "—"}
                  </div>
                  <div>
                    <span className="text-gray-500">النوع:</span>{" "}
                    {n.type?.split("\\")[2] ?? "—"}
                  </div>
                  <div>
                    {n.data?.url ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {linkText}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  {!n.read_at && (
                    <div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        تعليم كمقروء
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination المشترك — يظهر تحت المحتوى */}

      <Pagination
        pagination={pagination}
        onPageChange={(n) => onPageChange?.(n)}
        onPerPageChange={(per) => onPerPageChange?.(per)}
        perPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}
