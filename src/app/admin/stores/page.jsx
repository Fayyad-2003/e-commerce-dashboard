"use client";
import dynamic from "next/dynamic";
import Table from "../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import useMainStoreCategories from "../../../../hooks/stores/useMainStoreCategories";

function StoreCategoriesPageClient() {
    const {
        categories,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useMainStoreCategories();

    return (
        <SectionLayout
            title="تصنيفات المتاجر"
            addHref="/admin/store-categories/new"
            addLabel="إضافة تصنيف جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل التصنيفات"
            >
                <Table
                    data={categories}
                    pagination={pagination}
                    categorie="التصنيف"
                    sub="المتاجر"
                    url="/admin/stores/category" // Links to /admin/stores/category/[id]
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    editHref={(item) => `/admin/store-categories/${item.id}/update`}
                    deleteHref="/api/store-categories/delete"
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreCategoriesPageClient), { ssr: false });
