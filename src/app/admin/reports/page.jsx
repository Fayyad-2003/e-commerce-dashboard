"use client";
import dynamic from "next/dynamic";
import { ConditionalRender } from "../../../../components/common";
import { ReportsTable } from "../../../../components/tables";
import { useReports } from "../../../../hooks";

export function SalesAnalyticsPage() {
  const {
    activeTab,
    setActiveTab,
    from,
    setFrom,
    to,
    setTo,
    rows,
    pagination,
    loading,
    err,
    columns,
    goToPage,
    changePerPage,
    applyFilters,
    changeTab, // <--- Add this
  } = useReports();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">تقارير المبيعات</h2>

      {/* التابات */}
      <div className="flex border-b mb-6 gap-2">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "products"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
            }`}
          onClick={() => changeTab("products")}
        >
          المنتجات الأكثر مبيعاً
        </button>

        <button
          className={`px-4 py-2 font-medium ${activeTab === "customers"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
            }`}
          onClick={() => changeTab("customers")}
        >
          الزبائن الأكثر شراءً
        </button>
      </div>

      {/* فلاتر التاريخ */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => applyFilters()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          تطبيق الفلتر
        </button>

        <div className="flex items-center gap-2">
          <span>إلى:</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <span>من:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <ConditionalRender
        loading={loading}
        error={err}
        loadingText="جار تحميل التقارير"
      >
        <ReportsTable
          data={rows}
          columns={columns}
          title={activeTab === "products" ? "المنتجات الأكثر مبيعاً" : "الزبائن الأكثر شراءً"}
          showFilter={false}
          pagination={pagination}
          onPageChange={goToPage}
          onPerPageChange={changePerPage}
        />
      </ConditionalRender>
    </div>
  );
}

export default dynamic(() => Promise.resolve(SalesAnalyticsPage), { ssr: false });
