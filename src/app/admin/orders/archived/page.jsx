"use client"
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../../components/common";
import { OrdersTable } from "../../../../../components/tables";
import useArchivedOrders from "../../../../../hooks/main/useArchivedOrders";

function ArchivedOrdersPage() {
    const {
        orders,
        pagination,
        loading,
        err,
        goToPage,
        handleDelete,
        changePerPage,
        handleToggleArchive
    } = useArchivedOrders();

    return (
        <SectionLayout title="الطلبيات المؤرشفة" backHref="/admin/orders">
            <ConditionalRender
                loading={loading}
                error={err}
                loadingText="جاري تحميل الطلبيات المؤرشفة"
            >
                <OrdersTable
                    orders={orders}
                    onDelete={handleDelete}
                    onToggleArchive={handleToggleArchive}
                    pagination={pagination}
                    onPageChange={goToPage}
                    onPerPageChange={changePerPage}
                />
            </ConditionalRender>
        </SectionLayout>
    );
}

export default dynamic(() => Promise.resolve(ArchivedOrdersPage), { ssr: false });
