"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

/**
 * named export so your existing imports like:
 * import { useAccounts } from ".../hooks"
 * keep working.
 */
export default function useAccounts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    reload,
    setData: setAccounts
  } = useFetchList({
    url: "/api/customers"
  });

  const handleDelete = async (customer) => {
    const id = customer?.id;
    if (!id) return;

    // Snapshot
    const previous = [...accounts];

    // Optimistic Update
    setAccounts((current) => current.filter((a) => a.id !== id));

    try {
      const res = await fetchClient(`/api/customers/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || `فشل الحذف (HTTP ${res.status})`);
      }
      toast.success("✅ تم حذف المستخدم");
      // reload list if needed, but we do optimistic delete
    } catch (e) {
      toast.error(e?.message || "خطأ أثناء حذف الحساب");
      setAccounts(previous); // Revert
    }
  };

  return {
    accounts,
    pagination,
    loading,
    error,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
