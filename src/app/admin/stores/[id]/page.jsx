"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import useStores from "../../../../hooks/stores/useStores";

function StoreLevel2Page() {
    const params = useParams();
    const categoryId = params?.id;

    // Fetch stores belonging to this category
    const {
        stores,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStores(categoryId);

    const categoryName = meta?.category_name || "";

    return (
        <SectionLayout
            title={`المتاجر — تصنيف ${categoryName}`}
            backHref="/admin/stores"
            addHref={`/admin/stores/${categoryId}/new`}
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
                    url="/admin/stores" // This creates link to /admin/stores/[storeId]
                    // But we want /admin/stores/[storeId]/sub-categories
                    // If Table appends ID: /admin/stores/55
                    // But /admin/stores/55 is THIS page (L2) but with ID 55.
                    // If CatId=55, it shows stores.
                    // If StoreId=55, we want SubCats.
                    // Ambiguity! /admin/stores/[id] handles both.

                    // Solution: Use different path for SubCategories.
                    // url="/admin/stores/details" -> /admin/stores/details/55

                    // Or change L2 path to: /admin/stores/categories/[catId]
                    // This separates the namespace.

                    // Let's Pivot Back:
                    // L1: /admin/stores (Cats)
                    // Link to: /admin/stores/c/[catId] (Stores)
                    // Link to: /admin/stores/s/[storeId] (SubCats)

                    // Or keep it simple:
                    // L1: /admin/stores
                    // L2: /admin/stores/cat/[id]
                    // L3: /admin/stores/store/[id]/sub-categories

                    // I will implement: 
                    // L2 Link: `/admin/stores/[id]/redirect-to-sub`? No.

                    // Let's use `url` prop effectively.
                    // Verify if Table allows full URL construction? 
                    // Usually it blindly appends `/${item.id}`.

                    // If I put `url="/admin/stores/store"`, it goes to `/admin/stores/store/55`.
                    // So I can build: `src/app/admin/stores/store/[id]/sub-categories/page.jsx`

                    // Yes. Let's do that to avoid ID collision.
                    // L1 lists Cats. Table url="/admin/stores/category".
                    // L2: `src/app/admin/stores/category/[id]/page.jsx` (Lists Stores). url="/admin/stores/store"
                    // L3: `src/app/admin/stores/store/[id]/sub-categories/page.jsx` (Lists SubCats).

                    // Update L1 url first.
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel2Page), { ssr: false });
