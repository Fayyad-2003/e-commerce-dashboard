"use client";
import { useMemo } from "react";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

export default function useArchivedOrders() {
    const {
        data: rawOrders,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
        setData: setRawOrders
    } = useFetchList({
        url: (page, perPage) => `/api/orders/archived?page=${page}&per_page=${perPage}`,
        dependencies: []
    });

    const orders = useMemo(() => {
        return rawOrders.map((o) => ({
            id: Number(o.id),
            orderNumber: String(o.id),
            date: o.created_at || "—",
            status: String((o.status || "pending")).toLowerCase(),
            total: Number(o.final_total ?? o.subtotal ?? 0),
            user: o.user ?? null,
            raw: o,
            is_archived: true // These are always archived as they come from the archived endpoint
        }));
    }, [rawOrders]);

    const handleToggleArchive = async (orderId) => {
        if (!confirm("هل تريد إلغاء الأرشفة لهذه الطلبية؟")) return;

        // Snapshot
        const previousOrders = [...rawOrders];

        // Optimistic Remove
        setRawOrders((os) => os.filter((o) => o.id !== orderId));

        try {
            const res = await fetchClient(`/api/orders/${orderId}/toggle-archive`, {
                method: "POST",
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.message || "فشل إلغاء الأرشفة");
            // No reload needed
        } catch (e) {
            alert(e?.message || "فشل إلغاء الأرشفة");
            setRawOrders(previousOrders); // Revert
        }
    };

    const handleDelete = async (orderId) => {
        if (!confirm("تأكيد: هل تريد حذف هذه الطلبية نهائياً؟")) return;

        // Snapshot
        const previousOrders = [...rawOrders];

        // Optimistic Remove
        setRawOrders((os) => os.filter((o) => o.id !== orderId));

        try {
            const res = await fetchClient(`/api/orders/${orderId}/delete`, {
                method: "DELETE",
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.message || "فشل حذف الطلبية");
            // No reload needed
        } catch (e) {
            alert(e?.message || "فشل حذف الطلبية");
            setRawOrders(previousOrders); // Revert
        }
    };

    return {
        orders,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
        handleToggleArchive,
        handleDelete,
        reload
    };
}
