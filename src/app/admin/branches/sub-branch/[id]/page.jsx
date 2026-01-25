"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import Table from "../../../../../../components/home/Table";
import {
  ConditionalRender,
  SectionLayout,
} from "../../../../../../components/common";
import { useSubCategories } from "../../../../../../hooks";

export function Page() {
  const params = useParams();
  const categoryId = params?.id ?? "";

  const {
    data,
    pagination,
    loading,
    err,
    goToPage,
    meta,
    changePerPage,
    handleDelete, // <-- grab the delete handler
  } = useSubCategories(categoryId);

  // حساب اسم القسم بطريقة آمنة وإضافة "ال" إذا لم تكن موجودة
  const displayCategoryName = useMemo(() => {
    const raw = meta?.category_name;
    if (!raw) return null; // لا نعرض شيء حتى يُحمّل الاسم فعلاً
    const trimmed = raw.toString().trim();
    if (!trimmed) return null;
    // إذا كان يبدأ بالفعل بـ "ال" نتركه كما هو، وإلا نضيف "ال"
    return trimmed.startsWith("ال") ? trimmed : `ال${trimmed}`;
  }, [meta?.category_name]);

  // تكوين العنوان شرطياً لتجنب عرض "undefined"
  const title = displayCategoryName
    ? `الأقسام الرئيسية — قسم ${displayCategoryName}`
    : "الأقسام الرئيسية"; // أو "الأقسام الفرعية — جارٍ التحميل..." لو تفضل أن يظهر نص للتحميل

  return (
    <SectionLayout
      title={title}
      backHref="/"
      addHref={`/admin/branches/sub-branch/${categoryId}/new`}
      addLabel="إضافة قسم جديد"
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل الأقسام الفرعية"
      >
        <Table
          data={data}
          pagination={pagination}
          categorie="القسم الفرعي"
          sub="null"
          url="/admin/branches/sub-branch"
          editHref={(item) => `/admin/branches/sub-branch/${item?.id}/update`}
          // NOTE: use onDelete like in categories
          deleteLabel="هذا القسم الفرعي"
          onDelete={(id) => handleDelete(id)}
          onPageChange={(n) => goToPage(n)}
          onPerPageChange={(per) => changePerPage(per)}
          subCol="products"
          showPriority={true}
          priorityUpdateUrl="/api/sub-categories/edit"
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(Page), { ssr: false });
