"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";
import { showConfirm } from "../../src/lib/confirm";

export default function useAdsList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        data: ads,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
    } = useFetchList({
        url: "/api/ads"
    });

    async function handleDelete(adId) {
        const ok = await showConfirm({
            title: "حذف الإعلان",
            text: "هل أنت متأكد أنك تريد حذف هذا الإعلان؟",
            confirmButtonText: "حذف",
            icon: "warning"
        });
        if (!ok) return;

        try {
            const res = await fetchClient(`/api/ads/${adId}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "تعذّر حذف الإعلان");
                return;
            }

            toast.success(json.message || "تم حذف الإعلان بنجاح");

            // Reload list using generic reload
            reload();
        } catch (err) {
            toast.error(`خطأ: ${err?.message || err}`);
        }
    }

    return {
        ads,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
        reload,
        handleDelete,
    };
}
