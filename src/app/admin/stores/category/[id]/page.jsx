"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";
import useStores from "../../../../../../hooks/stores/useStores";

function StoreLevel2Page() {
    const params = useParams();
    const categoryId = params?.id;

    const {
        stores,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStores(categoryId);

    const categoryName = meta?.category_name || "";

    const handleUpdateStore = async (item) => {
        const newName = prompt("أدخل الاسم الجديد للمتجر:", item.name);
        if (!newName || newName === item.name) return;

        try {
            const formData = new FormData();
            formData.append("name", newName);
            formData.append("store_category_id", String(categoryId));
            formData.append("_method", "PUT");

            const res = await fetchClient(`/api/stores/${item.id}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const out = await res.json().catch(() => ({}));
                throw new Error(out.message || "فشل تحديث المتجر");
            }

            alert("تم التحديث بنجاح");
            goToPage(pagination.current_page);
        } catch (err) {
            alert(`خطأ: ${err.message}`);
        }
    };

    return (
        <SectionLayout
            title={`المتاجر — تصنيف ${categoryName}`}
            backHref="/admin/stores"
            addHref={`/admin/stores/category/${categoryId}/new`}
            addLabel="إضافة متجر جديد"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل المتاجر"
            >
                <Table
                    data={stores}
                    pagination={pagination}
                    categorie="المتجر"
                    sub="الأقسام الفرعية"
                    url="/admin/stores/store"
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    isProduct={false}
                    onUpdate={handleUpdateStore}
                    deleteHref="/api/stores"
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel2Page), { ssr: false });
