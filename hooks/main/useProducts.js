"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useProducts(subId, page, per_page) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const res = await fetchClient(
          `/api/products?sub_id=${subId}&page=${page}&per_page=${per_page}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!alive) return;
        setData(json.data || []);
        setMeta(json.meta || null);
      } catch (e) {
        if (alive) setErr(e?.message || "حدث خطأ أثناء الجلب");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (subId) load();
    return () => { alive = false; };
  }, [subId, page, per_page]);

  return { data, meta, loading, err };
}
