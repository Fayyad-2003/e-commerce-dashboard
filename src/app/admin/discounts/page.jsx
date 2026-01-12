"use client";
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { useDiscounts } from "../../../../hooks";
import { DiscountsTable } from "../../../../components/tables";

function DiscountsPageClient() {
  const {
    discounts,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
  } = useDiscounts();

  return (
    <SectionLayout
      title="الخصومات"
      addLabel="إضافة خصم جديد"
      addHref="/admin/discounts/new"
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جاري تحميل الخصومات"
      >
        <DiscountsTable
          discounts={discounts}
          pagination={pagination}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
          onDelete={handleDelete}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(DiscountsPageClient), { ssr: false });
