"use client";
import dynamic from "next/dynamic";
import Table from "../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import useMainStoreCategories from "../../../../hooks/stores/useMainStoreCategories";

function StoreCategoriesPageClient() {
    const {
        categories,
        pagination,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useMainStoreCategories();

    const handleUpdateCategory = async (item) => {
        const newName = prompt("أدخل الاسم الجديد للتصنيف:", item.name);
        if (!newName || newName === item.name) return;

        try {
            const formData = new FormData();
            formData.append("name", newName);
            formData.append("_method", "PUT");

            const res = await fetchClient(`/api/store-categories/${item.id}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const out = await res.json().catch(() => ({}));
                throw new Error(out.message || "فشل تحديث التصنيف");
            }

            alert("تم التحديث بنجاح");
            goToPage(pagination.current_page); // Refresh current page
        } catch (err) {
            alert(`خطأ: ${err.message}`);
        }
    };

    return (
        <SectionLayout
            title="تصنيفات المتاجر"
            addHref="/admin/store-categories/new"
            addLabel="إضافة تصنيف جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل التصنيفات"
            >
                <Table
                    data={categories}
                    pagination={pagination}
                    categorie="التصنيف"
                    sub="المتاجر"
                    url="/admin/stores/category" // Links to /admin/stores/category/[id]
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    onUpdate={handleUpdateCategory}
                    deleteHref="/api/store-categories"
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreCategoriesPageClient), { ssr: false });
