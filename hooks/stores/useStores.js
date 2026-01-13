import { useMemo } from "react";
import useFetchList from "../useFetchList";

export default function useStores(categoryId = null) {
    const {
        data: rawStores,
        meta,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
    } = useFetchList({
        url: (page, perPage) => {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("per_page", String(perPage));
            if (categoryId) params.set("category_id", categoryId);
            return `/api/stores?${params.toString()}`;
        },
        dependencies: [categoryId]
    });

    const stores = useMemo(() => {
        return rawStores.map(store => ({
            ...store,
            image: store.logo || store.image // Ensure Table's getImageSrc finds it
        }));
    }, [rawStores]);

    return {
        stores,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
        reload,
    };
}
