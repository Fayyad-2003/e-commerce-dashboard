"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";

export default function useUnitsOfMeasure() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setUnits
  } = useFetchList({
    url: "/api/units-of-measure",
    basePath: "/admin/sizetable"
  });

  const handleCreateUnit = async (name) => {
    try {
      const formData = new FormData();
      formData.append("name", name);

      const res = await fetchClient("/api/units-of-measure/store", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "تعذّر إنشاء الوحدة");
      }

      toast.success("✅ تم إنشاء وحدة القياس بنجاح");
      await reload();
      return true;
    } catch (err) {
      toast.error(`خطأ: ${err?.message || err}`);
      return false;
    }
  };

  const handleDelete = async (unitId) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف وحدة القياس هذه؟")) return;

    // Snapshot
    const previous = [...data];

    // Optimistic
    setUnits(current => current.filter(u => u.id !== unitId));

    try {
      const res = await fetchClient(`/api/units-of-measure/${unitId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "تعذّر حذف وحدة القياس");
      }

      toast.success("✅ تم حذف وحدة القياس");
      // No reload() needed
    } catch (err) {
      toast.error(`خطأ: ${err?.message || err}`);
      setUnits(previous); // Revert
    }
  };

  return {
    data,
    pagination,
    loading,
    err,
    handleCreateUnit,
    handleDelete,
    reload,
    goToPage,
    changePerPage,
  };
}
