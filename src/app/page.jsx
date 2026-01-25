"use client";
import Table from "../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../components/common";
import { useBranches } from "../../hooks";
import dynamic from "next/dynamic";

export function Home() {
  const {
    branches,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
  } = useBranches();

  return (
    <SectionLayout
      title="الأقسام الرئيسية"
      addHref="/admin/branches/add"
      addLabel="اضافة قسم رئيسي جديد"
      hideBackButton
    >
      <ConditionalRender loading={loading} error={err} loadingText="جار تحميل الأقسام الرئيسية">
        <Table
          data={branches}
          pagination={pagination}
          categorie="القسم الرئيسي"
          sub="الأقسام الفرعية"
          url="/admin/branches/sub-branch/"
          editHref={(item) => `/admin/branches/edit/${item.id}`}
          deleteLabel="هذا القسم"
          onDelete={(id) => handleDelete(id)}
          onPageChange={(n) => goToPage(n)}
          onPerPageChange={(per) => changePerPage(per)}
          showPriority={true}
          priorityUpdateUrl="/api/categories"
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });

