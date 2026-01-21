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
        if (!confirm("هل أنت متأكد أنك تريد حذف هذا الإعلان؟")) return;

        try {
            const res = await fetchClient(`/api/ads/${adId}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                alert(json.message || "تعذّر حذف الإعلان");
                return;
            }

            alert(json.message || "تم حذف الإعلان بنجاح");

            // Reload list using generic reload
            reload();

            // Note: Router push logic from before was mostly to refresh server components or URL params.
            // Since useFetchList handles URL and Reload fetches new data, we might not need to push explicitly 
            // unless we want to strip other params or specific behavior. 
            // The existing behavior kept query params. useFetchList reload fetches based on current params.
            // So reload() is sufficient. But purely keeping original behavior:
            // const sp = new URLSearchParams(searchParams.toString());
            // router.push(`/admin/ads?${sp.toString()}`); 
            // ^ This actually does nothing if params haven't changed.
        } catch (err) {
            alert(`خطأ: ${err?.message || err}`);
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
