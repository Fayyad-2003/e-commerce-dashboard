"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../components/home/Table";
import {
    ConditionalRender,
    SectionLayout,
} from "../../../../../components/common";
import { useStoreCategories } from "../../../../../hooks";

function StoreCategoriesPage() {
    const params = useParams();
    const storeId = params?.id;

    const {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStoreCategories(storeId);

    const storeName = meta?.store_name || "";

    return (
        <SectionLayout
            title={`المتاجر — أقسام ${storeName}`}
            backHref="/admin/stores"
            addHref={`/admin/stores/categories/${storeId}/new`}
            addLabel="إضافة قسم جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جار تحميل الأقسام"
            >
                <Table
                    data={data}
                    pagination={pagination}
                    categorie="القسم"
                    sub="الأقسام الفرعية"
                    url="/admin/stores/sub-categories"
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreCategoriesPage), { ssr: false });
