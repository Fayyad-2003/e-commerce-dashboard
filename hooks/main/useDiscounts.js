"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

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
  } = useFetchList({
    url: "/api/discounts"
  });

  async function handleDelete(discountId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الخصم؟")) return;

    try {
      const res = await fetchClient(`/api/discounts/${discountId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر حذف الخصم");
        return;
      }

      alert(json.message || "تم حذف الخصم بنجاح");
      reload();
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
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
