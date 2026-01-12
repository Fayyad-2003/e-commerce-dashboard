"use client";
import dynamic from "next/dynamic";
import Table from "../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { useStores } from "../../../../hooks";

function StoresPageClient() {
    const {
        stores,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStores();

    return (
        <SectionLayout
            title="المتاجر"
            addHref="/admin/stores/new"
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
                    sub="الأقسام"
                    url="/admin/stores/categories"
                    // We redirect to categories on click by using url prop
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoresPageClient), { ssr: false });
