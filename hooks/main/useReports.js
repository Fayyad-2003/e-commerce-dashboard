import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

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
      // Fix: check last_sold_date first
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

/**
 * useReports
 * - reads page & per_page from URL via useSearchParams()
 * - returns pagination + handlers: goToPage, changePerPage, applyFilters
 */
export function useReports() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read applied filters from URL (source of truth for API)
  const urlTab = searchParams.get("tab") || "products";
  const urlFrom = searchParams.get("from") || daysAgo(30);
  const urlTo = searchParams.get("to") || today();

  // local UI state (decoupled from API trigger)
  const [activeTab, setActiveTab] = useState(urlTab);
  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);

  // data + meta + pagination
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // read page & per_page from URL (reactively)
  const page = Number(searchParams.get("page") ?? 1);
  const perPage = Number(searchParams.get("per_page") ?? 50);

  // columns memo
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

  // load data from API using given page/perPage (or URL ones)
  const load = useCallback(
    async ({ pageOverride = null, perPageOverride = null } = {}) => {
      try {
        setLoading(true);
        setErr("");

        const url = new URL("/api/reports", window.location.origin);
        url.searchParams.set("tab", urlTab); // Use URL state
        url.searchParams.set("from", urlFrom ?? ""); // Use URL state
        url.searchParams.set("to", urlTo ?? ""); // Use URL state

        const p = pageOverride ?? page;
        const pp = perPageOverride ?? perPage;
        url.searchParams.set("page", String(p));
        url.searchParams.set("per_page", String(pp));

        const res = await fetchClient(url.toString(), { cache: "no-store" });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || `HTTP ${res.status}`);
        }

        const items = Array.isArray(json?.data) ? json.data : [];
        const metaObj = json?.meta ?? null;
        setMeta(metaObj);

        // build pagination object (safely reading metaObj.pagination or metaObj)
        const pmeta = (metaObj && (metaObj.pagination || metaObj)) || {};
        setPagination({
          total: Number(pmeta.total ?? items.length),
          per_page: Number(pmeta.per_page ?? pp),
          current_page: Number(pmeta.current_page ?? p),
          last_page: Number(pmeta.last_page ?? 1),
          from: Number(pmeta.from ?? (items.length ? 1 : 0)),
          to: Number(pmeta.to ?? items.length),
        });

        const mapper = urlTab === "products" ? mapProductRows : mapCustomerRows;
        setRows(mapper(items));
      } catch (e) {
        setErr(e?.message || "تعذّر الجلب");
        setRows([]);
        setMeta(null);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current_page: 1,
          last_page: 1,
          from: 0,
          to: 0,
        }));
      } finally {
        setLoading(false);
      }
    },
    [urlTab, urlFrom, urlTo, page, perPage]
  );

  const reload = useCallback(() => load(), [load]);

  // Effect to sync local state with URL (e.g. back button)
  useEffect(() => {
    setActiveTab(urlTab);
    setFrom(urlFrom);
    setTo(urlTo);
  }, [urlTab, urlFrom, urlTo]);

  // effect: run when URL filters or page/perPage change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab, urlFrom, urlTo, page, perPage]);

  // navigate to a specific page (keeping current filters)
  const goToPage = (n) => {
    const nn = Number(n) || 1;
    const last = Math.max(1, Number(pagination.last_page ?? 1));
    const target = Math.max(1, Math.min(nn, last));
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(target));
    sp.set("per_page", String(perPage));
    // keep date filters & tab in the query (from URL truth)
    sp.set("from", String(urlFrom ?? ""));
    sp.set("to", String(urlTo ?? ""));
    sp.set("tab", urlTab);
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  // change items per page -> reset to page 1
  const changePerPage = (newPer) => {
    const per = Number(newPer) || 50;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(per));
    sp.set("from", String(urlFrom ?? ""));
    sp.set("to", String(urlTo ?? ""));
    sp.set("tab", urlTab);
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  // apply filters (push filters into URL and reset page)
  const applyFilters = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1");
    sp.set("per_page", String(perPage));
    sp.set("from", String(from ?? "")); // use local UI state here to update URL
    sp.set("to", String(to ?? "")); // use local UI state here to update URL
    sp.set("tab", activeTab);
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  // NEW: explicitly change tab and update URL immediately to avoid stale state
  const changeTab = (newTab) => {
    setActiveTab(newTab);
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", "1"); // reset page
    sp.set("per_page", String(perPage));
    sp.set("from", String(from ?? ""));
    sp.set("to", String(to ?? ""));
    sp.set("tab", newTab); // use newTab, not activeTab (which is stale in closure)
    router.push(`${window.location.pathname}?${sp.toString()}`);
  };

  return {
    activeTab,
    setActiveTab,
    changeTab, // <--- exposed
    from,
    setFrom,
    to,
    setTo,
    rows,
    meta,
    pagination,
    loading,
    err,
    load,
    reload,
    applyFilters,
    goToPage,
    changePerPage,
    columns,
  };
}

export default useReports;
