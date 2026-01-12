"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useFetchList from "../useFetchList";

// --- Helpers ---
const fmt = (d) => (typeof d === "string" ? d : d?.toISOString()?.slice(0, 10));
const today = () => fmt(new Date());
const daysAgo = (n) => {
  const x = new Date();
  x.setDate(x.getDate() - n);
  return fmt(x);
};

function mapProductRows(apiItems = []) {
  return apiItems.map((it) => {
    const p = it?.product || {};
    const qty = Number(it?.total_quantity_sold ?? 0);
    const price = Number(p?.base_price ?? 0);
    return {
      id: p?.id ?? it?.product_id,
      name: p?.name ?? "-",
      sales: qty,
      revenue: qty * price,
      date: it?.last_sold_date || it?.last_sold_at || "-",
    };
  });
}

function mapCustomerRows(apiItems = []) {
  return apiItems.map((it) => {
    const cust = it?.customer || it?.user || {};
    return {
      id: cust?.id ?? it?.customer_id ?? it?.user_id,
      name: cust?.name || cust?.full_name || "-",
      purchases: Number(it?.total_orders ?? it?.purchases_count ?? it?.orders_count ?? 0),
      total: Number(it?.total_spent ?? it?.sum_amount ?? 0),
    };
  });
}

export function useReports() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Filter State
  const urlTab = searchParams.get("tab") || "products";
  const urlFrom = searchParams.get("from") || daysAgo(30);
  const urlTo = searchParams.get("to") || today();

  const [activeTab, setActiveTab] = useState(urlTab);
  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);

  useEffect(() => {
    setActiveTab(urlTab);
    setFrom(urlFrom);
    setTo(urlTo);
  }, [urlTab, urlFrom, urlTo]);

  // 2. Data Fetching
  const {
    data: rawItems,
    meta,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    // useFetchList handles page/per_page via URL
  } = useFetchList({
    url: (page, perPage) => {
      const u = new URLSearchParams();
      u.set("page", String(page));
      u.set("per_page", String(perPage));
      u.set("tab", urlTab);
      u.set("from", urlFrom ?? "");
      u.set("to", urlTo ?? "");
      return `/api/reports?${u.toString()}`;
    },
    dependencies: [urlTab, urlFrom, urlTo]
  });

  // 3. Data Transformation
  const rows = useMemo(() => {
    const mapper = urlTab === "products" ? mapProductRows : mapCustomerRows;
    return mapper(rawItems);
  }, [rawItems, urlTab]);

  // 4. Columns Definition
  const columns = useMemo(() => {
    const dateRender = (item) => {
      if (!item.date || item.date === "-") return "-";
      try {
        return new Date(item.date).toLocaleString("en-US");
      } catch {
        return item.date;
      }
    };

    if (activeTab === "products")
      return [
        { header: "المنتج", accessor: (item) => item.name },
        { header: "عدد المبيعات", accessor: (item) => item.sales },
        {
          header: "الإيرادات ($)",
          accessor: (item) => Number(item.revenue || 0).toLocaleString(),
          className: "text-green-600 font-medium",
        },
        { header: "تاريخ آخر بيع", accessor: dateRender },
      ];
    return [
      { header: "الزبون", accessor: (item) => item.name },
      { header: "عدد الطلبات", accessor: (item) => item.purchases },
      {
        header: "إجمالي المشتريات ($)",
        accessor: (item) => Number(item.total || 0).toLocaleString(),
        className: "text-blue-600 font-medium",
      },
    ];
  }, [activeTab]);

  // 5. Filter Handlers
  const applyFilters = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("from", String(from ?? ""));
    sp.set("to", String(to ?? ""));
    sp.set("tab", activeTab);
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  const changeTab = (newTab) => {
    setActiveTab(newTab);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("from", String(from ?? ""));
    sp.set("to", String(to ?? ""));
    sp.set("tab", newTab);
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  // Override goToPage/changePerPage to keep filters
  // useFetchList's default handlers maintain current searchParams, so this is handled automatically!
  // But implementation in useFetchList: 
  // const sp = new URLSearchParams(searchParams.toString()); sp.set("page"...);
  // So yes, it preserves existing params (from, to, tab).
  // We don't need to override them unless we want specific behavior.

  // Legacy 'load' compatibility not needed since 'reload' exists.

  return {
    activeTab,
    setActiveTab,
    changeTab,
    from,
    setFrom,
    to,
    setTo,
    rows,
    meta,
    pagination,
    loading,
    err,
    reload,
    load: reload, // alias for compatibility
    applyFilters,
    goToPage,
    changePerPage,
    columns,
  };
}

export default useReports;
