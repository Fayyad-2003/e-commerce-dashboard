/**
 * Formats a notification date string to Arabic locale.
 * @param {string} dateString 
 * @returns {string}
 */
export const formatNotificationDate = (dateString) => {
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

/**
 * Parses a raw notification object into a structured format for UI.
 * @param {Object} notification 
 * @returns {Object}
 */
export const parseNotification = (notification) => {
    if (!notification) return null;

    const data = notification.data || {};
    const isRead = !!notification.read_at;

    // Determine the URL/Href and link text
    let href = data.url || "#";
    let linkText = "التفاصيل";

    const isReviewLink = href.startsWith("/admin/reviews") || href.startsWith("/admin/store-reviews");
    if (isReviewLink) {
        href = "/admin/reviews?backUrl=/admin/notifications";
        linkText = "ذهاب للتقييمات";
    }

    return {
        id: notification.id,
        isRead,
        message: data.message || "—",
        productName: data.product_name || null,
        type: notification.type,
        href,
        linkText,
        createdAt: formatNotificationDate(notification.created_at),
        raw: notification // Keep raw data if needed for specific actions
    };
};
