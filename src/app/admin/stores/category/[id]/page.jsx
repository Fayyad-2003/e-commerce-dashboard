"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";
import useStores from "../../../../../../hooks/stores/useStores";

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
    } = useStores(categoryId);

    const categoryName = meta?.category_name || "";

    return (
        <SectionLayout
            title={`المتاجر — تصنيف ${categoryName}`}
            backHref="/admin/stores"
            addHref={`/admin/stores/category/${categoryId}/new`}
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
                    url="/admin/stores/store" // Links to /admin/stores/store/[id] -> which should redirect to sub-cats
                    // Or we link directly to sub-cats page if Table supported suffix.
                    // For now, let's create /admin/stores/store/[id]/page.jsx that redirects?
                    // Better: /admin/stores/store/[id]/sub-categories/page.jsx is the target.
                    // But Table links to /admin/stores/store/[id].
                    // So create that page and have it list sub-categories? 
                    // YES. /admin/stores/store/[id]/page.jsx will show sub-categories.
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel2Page), { ssr: false });
