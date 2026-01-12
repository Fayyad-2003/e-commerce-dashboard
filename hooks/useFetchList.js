"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../src/lib/fetchClient";

/**
 * Custom hook to handle standardized list fetching with pagination.
 * 
 * @param {Object} config
 * @param {string|Function} config.url - Endpoint URL string OR function(page, perPage) returning URL string. Return null to skip fetch.
 * @param {Array} [config.dependencies] - Dependency array for re-fetching (auto-added to useEffect).
 * @param {string} [config.basePath] - Base path for pagination redirects (defaults to current path).
 * @param {number} [config.defaultPage] - Default page number (default: 1).
 * @param {number} [config.defaultPerPage] - Default per page count (default: 10).
 */
export default function useFetchList({
    url,
    dependencies = [], // Additional deps for the fetch effect
    basePath = null, // If null, uses window.location.pathname
    defaultPage = 1,
    defaultPerPage = 10,
} = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. URL Params State
    const page = Number(searchParams.get("page") ?? defaultPage);
    const perPage = Number(searchParams.get("per_page") ?? defaultPerPage);

    // 2. Data State
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState(null); // Valid for API responses that include extra meta
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: perPage,
        current_page: page,
        last_page: 1,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 3. Construct API URL
    const apiUrl = useMemo(() => {
        if (typeof url === "function") {
            return url(page, perPage);
        }
        // If string, assume it creates query string itself OR we append common params?
        // Usually better to let the consumer build the string or pass a builder function.
        // If it's a static string like `/api/ads`, we need to append params.
        if (typeof url === "string") {
            const hasQuery = url.includes("?");
            const prefix = hasQuery ? "&" : "?";
            return `${url}${prefix}page=${page}&per_page=${perPage}`;
        }
        return null;
    }, [url, page, perPage, ...dependencies]);

    // 4. Fetch Function
    const reload = useCallback(async () => {
        if (!apiUrl) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetchClient(apiUrl, { cache: "no-store" });

            // Handle non-200 (fetchClient doesn't throw on 4xx/5xx unless configured, usually returns res)
            if (!res.ok) {
                // Try to parse error message
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || `HTTP ${res.status}`);
            }

            const json = await res.json();

            let arr = [];
            let p = json?.meta?.pagination ?? json?.meta ?? {};

            if (Array.isArray(json?.data)) {
                arr = json.data;
            } else if (json?.data?.data && Array.isArray(json.data.data)) {
                // Handle { data: { data: [...], ...meta } } pattern
                arr = json.data.data;
                // If standard meta is missing, try using the wrapper object values
                if (!p.total && !p.current_page) {
                    p = json.data;
                }
            } else if (Array.isArray(json)) {
                arr = json;
            }

            setData(arr);
            setMeta(json?.meta || null);
            setPagination({
                total: Number(p.total ?? arr.length),
                per_page: Number(p.per_page ?? perPage),
                current_page: Number(p.current_page ?? page),
                last_page: Number(p.last_page ?? 1),
            });
        } catch (e) {
            setError(e?.message || "تعذّر جلب البيانات");
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    // 5. Effect to Fetch
    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reload]);

    // 6. Pagination Handlers
    const getPath = () => {
        if (basePath) return basePath;
        if (typeof window !== "undefined") return window.location.pathname;
        return "";
    };

    const goToPage = (n) => {
        const nn = Number(n) || 1;
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("page", String(nn));
        sp.set("per_page", String(perPage));
        router.push(`${getPath()}?${sp.toString()}`);
    };

    const changePerPage = (newPer) => {
        const per = Number(newPer) || 10;
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("page", "1");
        sp.set("per_page", String(per));
        router.push(`${getPath()}?${sp.toString()}`);
    };

    return {
        data,
        meta,
        pagination,
        loading,
        error,
        reload,
        goToPage,
        changePerPage,
        // Expose setters if needed for optimistic updates, though reload/handleDelete usually safer
        setData,
    };
}
