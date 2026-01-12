"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useStoreCategories(storeId) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    });

    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const p = Number(searchParams.get("page") ?? 1);
        const pp = Number(searchParams.get("per_page") ?? 10);
        setPage(Number.isFinite(p) && p > 0 ? p : 1);
        setPerPage(Number.isFinite(pp) && pp > 0 ? pp : 10);
    }, [searchParams]);

    const apiUrl = useMemo(() => {
        if (!storeId) return null;
        const qs = new URLSearchParams({
            page: String(page),
            per_page: String(perPage),
        });
        return `/api/stores/${storeId}/categories?${qs.toString()}`;
    }, [storeId, page, perPage]);

    const reload = useCallback(async () => {
        if (!apiUrl) return;
        setLoading(true);
        setErr("");
        try {
            const res = await fetchClient(apiUrl, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            const arr = Array.isArray(json?.data) ? json.data : [];
            const p = json?.meta?.pagination ?? json?.meta ?? {};

            setData(arr);
            setMeta(json?.meta);
            setPagination({
                total: Number(p.total ?? arr.length),
                per_page: Number(p.per_page ?? perPage),
                current_page: Number(p.current_page ?? page),
                last_page: Number(p.last_page ?? 1),
            });
        } catch (e) {
            setErr(e?.message || "تعذّر جلب الأقسام");
        } finally {
            setLoading(false);
        }
    }, [apiUrl, page, perPage]);

    useEffect(() => {
        reload();
    }, [reload]);

    const goToPage = (n) => {
        const nn = Number(n) || 1;
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("page", String(nn));
        sp.set("per_page", String(perPage));
        router.push(`/admin/stores/categories/${storeId}?${sp.toString()}`);
    };

    const changePerPage = (newPer) => {
        const per = Number(newPer) || 10;
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("page", "1");
        sp.set("per_page", String(per));
        router.push(`/admin/stores/categories/${storeId}?${sp.toString()}`);
    };

    return {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
        reload,
    };
}
