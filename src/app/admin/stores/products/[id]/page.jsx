"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../components/home/Table"; // Or a specific ProductsTable if available
import {
    ConditionalRender,
    SectionLayout,
} from "../../../../../components/common";
import { useStoreProducts } from "../../../../../hooks";

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
            addHref={`/admin/stores/products/${subById}/new`}
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
                    sub="null"
                    // No deeper level
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    subCol="products" // To indicate product contextual rendering if Table supports it
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreProductsPage), { ssr: false });
