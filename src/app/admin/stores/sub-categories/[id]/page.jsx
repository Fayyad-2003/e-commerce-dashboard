"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table";
import {
    ConditionalRender,
    SectionLayout,
} from "../../../../../../components/common";
import useStoreSubCategories from "../../../../../../hooks/stores/useStoreSubCategories";

function StoreSubCategoriesPage() {
    const params = useParams();
    const categoryId = params?.id;

    const {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStoreSubCategories(categoryId);

    const categoryName = meta?.category_name || "";

    return (
        <SectionLayout
            title={`المتاجر — أقسام فرعية ${categoryName}`}
            // Ideally back to store categories, but we need storeId. Meta should provide it or we pass it in URL logic.
            // For now fallback to stores list or previous page logic
            backHref="/admin/stores"
            addHref={`/admin/stores/sub-categories/${categoryId}/new`}
            addLabel="إضافة قسم فرعي جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جار تحميل الأقسام الفرعية"
            >
                <Table
                    data={data}
                    pagination={pagination}
                    categorie="القسم الفرعي"
                    sub="المنتجات"
                    url="/admin/stores/products"
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreSubCategoriesPage), { ssr: false });
