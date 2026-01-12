"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useCreateSubBranch() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  // ✅ استخراج categoryId بطريقة آمنة
  const categoryId = useMemo(() => {
    let id = params?.id;
    if (Array.isArray(id)) id = id[0];

    if (!id && typeof pathname === "string") {
      const parts = pathname.split("/").filter(Boolean);
      id = parts[2];
    }
    return id ?? "";
  }, [params, pathname]);

  const handleSubmitSub = async ({ name, image }) => {
    if (!categoryId) return alert("لا يوجد category_id في المسار");
    if (!name?.trim()) return alert("اسم القسم الفرعي مطلوب");

    setIsSubmittingSub(true);

    try {
      const fd = new FormData();
      fd.append("category_id", String(categoryId));
      fd.append("name", name.trim());
      if (image) fd.append("image", image);

      const res = await fetchClient("/api/sub-categories", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      alert("تم إنشاء القسم الفرعي بنجاح!");
      router.push(`/admin/branches/sub-branch/${categoryId}`);
    } catch (error) {
      console.log(error);
      alert(error.message || "حدث خطأ أثناء إنشاء القسم الفرعي");
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return {
    categoryId,
    isSubmittingSub,
    handleSubmitSub,
    goBack: () => router.back(),
  };
}
