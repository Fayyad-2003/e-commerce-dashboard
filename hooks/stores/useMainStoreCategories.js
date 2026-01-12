"use client";
import useFetchList from "../useFetchList";

export default function useMainStoreCategories() {
    const {
        data: categories,
        pagination,
        loading,
        error: err,
        goToPage,
        changePerPage,
        reload,
    } = useFetchList({
        url: "/api/store-categories"
    });

    return {
        categories,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
        reload,
    };
}
