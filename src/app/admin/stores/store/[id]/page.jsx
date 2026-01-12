"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";
import useStoreSubCategories from "../../../../../../hooks/stores/useStoreSubCategories";

function StoreLevel3Page() {
    const params = useParams();
    const storeId = params?.id; // This is the store ID

    const {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStoreSubCategories(storeId);

    const storeName = meta?.store_name || "";

    return (
        <SectionLayout
            title={`الأقسام الفرعية — متجر ${storeName}`}
            backHref={`/admin/stores`} // Ideally back to category, but strict back logic is complex without context.
            addHref={`/admin/stores/store/${storeId}/new`}
            addLabel="إضافة قسم فرعي"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل الأقسام الفرعية"
            >
                <Table
                    data={data}
                    pagination={pagination}
                    categorie="القسم الفرعي"
                    sub="المنتجات"
                    url="/admin/stores/products" // Links to /admin/stores/products/[id]
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel3Page), { ssr: false });
