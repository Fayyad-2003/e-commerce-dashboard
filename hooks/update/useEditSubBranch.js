"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";

export default function useEditSubBranch() {
  const { id } = useParams();
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [initial, setInitial] = useState({
    name: "",
    image: null,
    imageUrl: "",
  });

  // ✅ Fetch branch data
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetchClient(`/api/sub-categories/edit/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const item = json?.data || json;
        const nextInitial = {
          name: item?.name ?? "",
          image: null, // file remains null; preview old URL only
          imageUrl: item?.image_url || item?.image || "",
        };

        if (alive) {
          setInitial(nextInitial);
          setCategoryId(item?.category_id);
        }
      } catch (e) {
        if (alive) setErr(e?.message || "فشل جلب بيانات القسم");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();

    return () => {
      alive = false;
    };
  }, [id]);

  // ✅ Update handler
  async function handleSubmit({ name, image }) {
    try {
      const form = new FormData();
      form.append("name", name);

      if (image instanceof File) {
        form.append("image", image);
      }

      const res = await fetchClient(`/api/sub-categories/edit/${id}`, {
        method: "PUT",
        body: form,
      });

      const out = await res.json().catch(() => null);

      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || `HTTP ${res.status}`);
      }

      router.push(`/admin/branches/sub-branch/${categoryId}`);
    } catch (e) {
      alert(`فشل التعديل: ${e?.message || e}`);
    }
  }

  return {
    loading,
    err,
    initial,
    handleSubmit,
    goBack: () => router.back(),
  };
}
