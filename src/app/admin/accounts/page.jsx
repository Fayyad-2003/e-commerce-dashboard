"use client";
import dynamic from "next/dynamic";
import { SectionLayout, ConditionalRender } from "../../../../components/common";
import CustomersTable from "../../../../components/tables/CustomersTable";
import { useAccounts } from "../../../../hooks"; // keeps existing import style

export function AccountsPage() {
  const {
    accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    handleDelete,
  } = useAccounts();

  return (
    <SectionLayout title="إدارة الحسابات">
      <ConditionalRender
        loading={loading}
        error={error}
        loadingText="جار تحميل الحسابات"
      >
        <CustomersTable
          accounts={accounts}
          pagination={pagination}
          onDelete={handleDelete}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(AccountsPage), { ssr: false });
