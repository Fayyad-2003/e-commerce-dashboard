"use client";
import useFetchList from "../useFetchList";

export default function useStoreProducts(subCategoryId) {
    const {
        data,
        meta,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
    } = useFetchList({
        url: (page, perPage) => {
            if (!subCategoryId) return null;
            return `/api/stores/sub-categories/${subCategoryId}/products?page=${page}&per_page=${perPage}`;
        },
        dependencies: [subCategoryId]
    });

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
