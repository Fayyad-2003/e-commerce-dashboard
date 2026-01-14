"use client";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Table from "../../../../../../components/home/Table";
import { ConditionalRender, SectionLayout } from "../../../../../../components/common";
import useStoreSubCategories from "../../../../../../hooks/stores/useStoreSubCategories";

function StoreLevel3Page() {
    const params = useParams();
    const storeId = params?.id; // This is the store ID

    const {
        data,
        pagination,
        meta,
        loading,
        err,
        goToPage,
        changePerPage,
    } = useStoreSubCategories(storeId);

    const storeName = meta?.store_name || "";

    const handleUpdateSection = async (item) => {
        const newName = prompt("أدخل الاسم الجديد للقسم الفرعي:", item.name);
        if (!newName || newName === item.name) return;

        try {
            const formData = new FormData();
            formData.append("name", newName);
            formData.append("store_id", String(storeId));
            formData.append("_method", "PUT");

            const res = await fetchClient(`/api/store-sections/${item.id}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const out = await res.json().catch(() => ({}));
                throw new Error(out.message || "فشل تحديث القسم");
            }

            alert("تم التحديث بنجاح");
            goToPage(pagination.current_page);
        } catch (err) {
            alert(`خطأ: ${err.message}`);
        }
    };

    return (
        <SectionLayout
            title={`الأقسام الفرعية — متجر ${storeName}`}
            backHref={`/admin/stores`} // Ideally back to category, but strict back logic is complex without context.
            addHref={`/admin/stores/store/${storeId}/new`}
            addLabel="إضافة قسم فرعي"
        >
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل الأقسام الفرعية"
            >
                <Table
                    data={data}
                    pagination={pagination}
                    categorie="القسم الفرعي"
                    sub="المنتجات"
                    url="/admin/stores/products" // Links to /admin/stores/products/[id]
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                    onUpdate={handleUpdateSection}
                    deleteHref="/api/store-sections"
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(StoreLevel3Page), { ssr: false });
