"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";

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
        alert(json.message || "تعذّر إنشاء الوحدة");
        return false;
      }

      alert("✅ تم إنشاء وحدة القياس بنجاح");
      await reload();
      return true;
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
      return false;
    }
  };

  const handleDelete = async (unitId) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف وحدة القياس هذه؟")) return;

    try {
      const res = await fetchClient(`/api/units-of-measure/${unitId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(json.message || "تعذّر حذف وحدة القياس");
        return;
      }

      alert("✅ تم حذف وحدة القياس");
      await reload();
    } catch (err) {
      alert(`خطأ: ${err?.message || err}`);
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
