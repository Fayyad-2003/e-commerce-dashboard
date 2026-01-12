"use client"
import dynamic from "next/dynamic";
import { ConditionalRender, SectionLayout } from "../../../../components/common";
import { OrdersTable } from "../../../../components/tables";
import { useOrders } from "../../../../hooks";

/* 
  Suit-Style Status Filter 
  - Clean, segmented control look.
  - specific colors for active states matching the status semantics.
*/
function StatusFilter({ current, onChange }) {
  const statuses = [
    { key: "all", label: "الكل" },
    // { key: "pending", label: "قيد الانتظار", activeClass: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { key: "processing", label: "قيد المعالجة", activeClass: "bg-blue-100 text-blue-800 border-blue-200" },
    { key: "completed", label: "مكتمل", activeClass: "bg-green-100 text-green-800 border-green-200" },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 p-1.5 bg-gray-50/80 rounded-lg border border-gray-100 w-fit">
      {statuses.map((s) => {
        const isActive = current === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive
                ? (s.activeClass || "bg-white text-gray-900 shadow-sm border border-gray-200")
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }
            `}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export function OrdersPage() {
  const {
    orders,
    pagination,
    loading,
    err,
    goToPage,
    handleComplete,
    changePerPage,
    selectedStatus,
    changeStatus
  } = useOrders();

  return (
    <SectionLayout title="قائمة الطلبيات">
      <StatusFilter current={selectedStatus} onChange={changeStatus} />

      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جاري تحميل الطلبيات"
      >
        <OrdersTable
          orders={orders}
          onUpdateStatus={handleComplete}
          pagination={pagination}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </SectionLayout>
  );
}

export default dynamic(() => Promise.resolve(OrdersPage), { ssr: false });
