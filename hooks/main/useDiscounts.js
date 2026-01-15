"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

export default function useDiscounts() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: discounts,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setDiscounts
  } = useFetchList({
    url: "/api/discounts"
  });

  async function handleDelete(discountId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الخصم؟")) return;

    // Snapshot
    const previous = [...discounts];

    // Optimistic
    setDiscounts(current => current.filter(d => d.id !== discountId));

    try {
      const res = await fetchClient(`/api/discounts/${discountId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "تعذّر حذف الخصم");
      }

      toast.success(json.message || "تم حذف الخصم بنجاح ✅");
      // No reload() needed
    } catch (err) {
      toast.error(`خطأ: ${err?.message || err}`);
      setDiscounts(previous); // Revert
    }
  }

  return {
    discounts,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    reload,
    handleDelete,
  };
}
