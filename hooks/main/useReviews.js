"use client";
import { useSearchParams } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import useFetchList from "../useFetchList";
import toast from "react-hot-toast";
import { showConfirm } from "../../src/lib/confirm";

export default function useReviews() {
  const searchParams = useSearchParams();

  const {
    data: comments,
    pagination,
    loading,
    error: err,
    goToPage,
    changePerPage,
    reload,
    setData: setComments, // Expose setter for optimistic updates
    page,
    per_page: perPage
    // Note: useFetchList doesn't usually expose page/perPage directly in return object but we can if needed
    // Original returned page/perPage. We can grab from params or pagination state.
  } = useFetchList({
    url: "/api/reviews"
  });

  const handleApprove = async (id) => {
    const realId = typeof id === "object" ? id.id ?? id : id;

    const ok = await showConfirm({
      title: "الموافقة على التعليق",
      text: "هل أنت متأكد من الموافقة على هذا التعليق؟ سيظهر للجميع.",
      confirmButtonText: "موافقة",
      icon: "question"
    });
    if (!ok) return;

    try {
      const res = await fetchClient(`/api/reviews/${realId}/approve`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل الموافقة على التعليق");

      // Optimistic update
      setComments((cs) =>
        cs.map((c) => (c.id === realId ? { ...c, status: "approved" } : c))
      );
      toast.success("✅ تم الموافقة على التعليق");
      // No reload() needed
    } catch (e) {
      toast.error(e.message || e);
    }
  };

  const handleReject = async (id) => {
    const realId = typeof id === "object" ? id.id ?? id : id;

    const ok = await showConfirm({
      title: "رفض التعليق",
      text: "هل أنت متأكد من رفض أو حذف هذا التعليق؟",
      confirmButtonText: "رفض",
      icon: "warning"
    });
    if (!ok) return;

    try {
      const res = await fetchClient(`/api/reviews/${realId}/delete`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "فشل رفض/حذف التعليق");

      // Optimistic update
      setComments((cs) => cs.filter((c) => c.id !== realId));
      toast.success("✅ تم رفض/حذف التعليق");
      // No reload() needed
    } catch (e) {
      toast.error(e.message || e);
    }
  };

  const dynamicBackHref = searchParams.get("backUrl") || "/";

  // Recover page/perPage for legacy return compatibility if needed by consumers
  const CurrentPage = Number(searchParams.get("page") ?? 1);
  const CurrentPerPage = Number(searchParams.get("per_page") ?? 10);

  return {
    page: CurrentPage,
    perPage: CurrentPerPage,
    comments,
    pagination,
    loading,
    err,
    goToPage,
    changePerPage,
    handleApprove,
    handleReject,
    dynamicBackHref,
  };
}


