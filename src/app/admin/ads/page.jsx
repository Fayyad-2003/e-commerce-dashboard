"use client";
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import useAdsList from "../../../../hooks/ads/useAdsList";
import AdsTable from "../../../../components/features/ads/AdsTable";

function AdsPageClient() {
    const {
        ads,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
        handleDelete,
    } = useAdsList();

    return (
        <SectionLayout
            title="الإعلانات"
            addLabel="إضافة إعلان جديد"
            addHref="/admin/ads/new"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل الإعلانات"
            >
                <AdsTable
                    ads={ads}
                    pagination={pagination}
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    onDelete={handleDelete}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(AdsPageClient), { ssr: false });
