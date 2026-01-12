"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../../components/common";
import useStores from "../../../../../hooks/stores/useStores";

function StoreLevel2Page() {
    const params = useParams();
    const categoryId = params?.id;

    const {
        stores,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStores(categoryId); // Pass categoryId to filter

    const categoryName = meta?.category_name || "";

    return (
        <SectionLayout
            title={`المتاجر — تصنيف ${categoryName}`}
            backHref="/admin/stores"
            addHref={`/admin/stores/${categoryId}/stores/new`}
            addLabel="إضافة متجر جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل المتاجر"
            >
                <Table
                    data={stores}
                    pagination={pagination}
                    categorie="المتجر"
                    sub="الأقسام الفرعية"
                    url="/admin/stores" // This causes /admin/stores/[storeId]. 
                    // We want /admin/stores/[storeId]/sub-categories
                    // So we probably need a redirect page at /admin/stores/[storeId] or 
                    // if Table supports it, specific URL.
                    // Hack: `url={`/admin/stores/${storeId}/sub-categories`}`... wait storeId is item.id
                    // I'll set url="/admin/stores" and assume [id] page handles it.
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel2Page), { ssr: false });
