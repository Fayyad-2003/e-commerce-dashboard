"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table"; // Or a specific ProductsTable if available
import {
    ConditionalRender,
    SectionLayout,
} from "../../../../../../components/common";
import useStoreProducts from "../../../../../../hooks/stores/useStoreProducts";

function StoreProductsPage() {
    const params = useParams();
    const subById = params?.id;

    const {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStoreProducts(subById);

    const subName = meta?.sub_category_name || "";

    return (
        <SectionLayout
            title={`المتاجر — منتجات ${subName}`}
            backHref="/admin/stores"
            addHref={`/admin/products/new?subId=${subById}`}
            addLabel="إضافة منتج جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جار تحميل المنتجات"
            >
                <Table
                    data={data}
                    pagination={pagination}
                    categorie="المنتج"
                    sub={null}
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    subCol={null}
                    deleteHref={(item) => `/api/admin/store-products/delete/${item.id}`}
                    deleteLabel="هذا المنتج"
                    editHref={(item) => `/admin/stores/products/${item.id}/update`}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreProductsPage), { ssr: false });
