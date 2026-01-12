"use client";
import { useMemo } from "react";
import Table from "../../../../../../components/home/Table";
import {
  ConditionalRender,
  SectionLayout,
} from "../../../../../../components/common";
import { useProductsBySub } from "../../../../../../hooks";

export default function Page() {
  const {
    data,
    meta,
    pagination,
    loading,
    err,
    subId,
    goToPage,
    changePerPage,
    handleDelete,
    mainCategoryId,
  } = useProductsBySub();

  // حساب اسم القسم الآمن وإضافة "ال" إذا لم يكن موجودًا
  const displaySubName = useMemo(() => {
    const raw = meta?.subcategory_name;
    if (!raw) return null;
    const trimmed = raw.toString().trim();
    if (!trimmed) return null;
    return trimmed.startsWith("ال") ? trimmed : `ال${trimmed}`;
  }, [meta?.subcategory_name]);

  const title = displaySubName
    ? `المنتجات - القسم ${displaySubName}`
    : "المنتجات";

  // حماية الروابط من ظهور "undefined" في المسار
  const safeSubId = subId ?? "";

  return (
    <SectionLayout
      title={title}
      addLabel="اضافة منتج جديد"
      addHref={`/admin/products/new?subId=${safeSubId}`}
      backHref={`/admin/branches/sub-branch/${mainCategoryId}`}
    >
      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل منتجات القسم الفرعي"
      >
        <Table
          data={data}
          pagination={pagination}
          categorie="اسم المنتج"
          sub="null"
          url="/admin/products"
          editHref={(item) => `/admin/products/${item?.id}/update`}
          deleteLabel="هذا المنتج"
          onDelete={(id) => handleDelete(id)} // <-- pass the delete handler here
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}
