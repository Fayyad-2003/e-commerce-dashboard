import { useMemo } from "react";
import useFetchList from "../useFetchList";

export default function useStoreSubCategories(storeId) {
    const {
        data: rawData,
        meta,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
    } = useFetchList({
        url: (page, perPage) => {
            if (!storeId) return null;
            return `/api/stores/${storeId}/store-sections?page=${page}&per_page=${perPage}`;
        },
        dependencies: [storeId]
    });

    const data = useMemo(() => {
        return rawData.map(item => ({
            ...item,
            image: item.logo || item.image
        }));
    }, [rawData]);

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
