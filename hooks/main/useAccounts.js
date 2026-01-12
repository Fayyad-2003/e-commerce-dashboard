"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

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
  } = useFetchList({
    url: "/api/customers"
  });

  const handleDelete = async (customer) => {
    const id = customer?.id;
    if (!id) return;
    if (!confirm(`هل تريد حذف المستخدم: ${customer.name}?`)) return;

    try {
      const res = await fetchClient(`/api/customers/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        alert(json?.message || `فشل الحذف (HTTP ${res.status})`);
        return;
      }
      alert("✅ تم حذف المستخدم");
      // reload list
      reload();
    } catch (e) {
      alert(e?.message || "خطأ أثناء حذف الحساب");
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
