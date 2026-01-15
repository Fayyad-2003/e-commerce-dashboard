"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";
import { showConfirm } from "../../src/lib/confirm";

export default function useBundles() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: offers,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setBundles
  } = useFetchList({
    url: "/api/offers"
  });

  /** ✅ Delete handler */
  const handleDelete = async (offer) => {
    const ok = await showConfirm({
      title: "حذف العرض",
      text: `هل أنت متأكد من حذف العرض "${offer.name}"؟`,
      confirmButtonText: "حذف",
      icon: "warning"
    });
    if (!ok) return;

    // Snapshot
    const previous = [...offers];

    // Optimistic
    setBundles(current => current.filter(o => o.id !== offer.id));

    try {
      const res = await fetchClient(`/api/offers/${offer.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "فشل حذف العرض");
      }

      toast.success("تم حذف العرض بنجاح ✅");
      // No reload() needed
    } catch (e) {
      toast.error(`❌ خطأ أثناء الحذف: ${e.message}`);
      setBundles(previous); // Revert
    }
  };

  return {
    offers,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleDelete,
    // useFetchList returns 'reload', useBundles exposes it implicitly or explicitly? 
    // Original exposed 'fetchOffers' only internally but not in return? 
    // Wait, checking original... 
    // Original returned: offers, pagination, loading, err, goToPage, changePerPage, handleDelete.
    // NO 'reload' or 'fetchOffers' returned.
    // So I don't need to return reload, but it doesn't hurt.
    reload
  };
}
