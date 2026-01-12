"use client";
import dynamic from "next/dynamic";
import { useUnitsOfMeasure } from "../../../../hooks";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { UnitsOfMeasureTable } from "../../../../components/tables";

export function SizeTablePageClient() {
  const {
    data,
    pagination,
    loading,
    err,
    handleCreateUnit,
    handleDelete,
    goToPage,
    changePerPage,
  } = useUnitsOfMeasure();

  return (
    <SectionLayout
      title="إدارة وحدات القياس"
      backHref="/"
      addHref="/admin/sizetable/new"
      addLabel="إضافة وحدة قياس جديدة"
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل وحدات القياس"
      >
        <UnitsOfMeasureTable
          data={data}
          pagination={pagination}
          basePath="/admin/sizetable"
          onCreateNew={handleCreateUnit}
          onDelete={handleDelete}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(SizeTablePageClient), { ssr: false });
