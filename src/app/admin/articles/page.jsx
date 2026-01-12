"use client";
import { ArticlesTable } from "../../../../components/tables";
import dynamic from "next/dynamic";
import {
  ConditionalRender,
  SectionLayout,
} from "../../../../components/common";
import { useArticles } from "../../../../hooks";

export function ArticlesPage() {
  const {
    articles,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
  } = useArticles();

  return (
    <SectionLayout
      title="إدارة المقالات"
      addHref="/admin/articles/new"
      addLabel="إضافة مقالة جديدة"
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جاري تحميل المقالات"
      >
        <ArticlesTable
          articles={articles}
          pagination={pagination}
          onDelete={handleDelete}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(ArticlesPage), { ssr: false });
