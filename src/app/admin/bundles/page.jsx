"use client";
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { useBundles } from "../../../../hooks";
import { BundlesTable } from "../../../../components/tables";

export function BundlesPage() {
  const {
    offers,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
  } = useBundles();

  return (
    <SectionLayout 
      title="العروض"
      addHref="/admin/bundles/new"
      addLabel="إضافة عرض جديد"
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جاري تحميل العروض"
      >
        <BundlesTable
          bundles={offers}
          pagination={pagination}
          onDelete={handleDelete}
          onPerPageChange={changePerPage}
          onPageChange={goToPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(BundlesPage), { ssr: false });
