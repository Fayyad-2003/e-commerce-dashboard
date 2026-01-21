"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchClient } from "../../src/lib/fetchClient";
import toast from "react-hot-toast";

export default function useEditMainBranch() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [initial, setInitial] = useState({
    name: "",
    image: null,
    imageUrl: "",
  });

  // ✅ Fetch initial data
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetchClient(`/api/categories/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const item = json?.data || json;
        const nextInitial = {
          name: item?.name ?? "",
          image: null,
          imageUrl: item?.image_url || item?.image || "",
        };

        if (alive) setInitial(nextInitial);
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

  // ✅ Submit
  async function handleSubmit({ name, image }) {
    try {
      const form = new FormData();
      form.append("name", name);

      if (image instanceof File) {
        form.append("image", image);
      }

      const res = await fetchClient(`/api/categories/${id}`, {
        method: "PUT",
        body: form,
      });

      const out = await res.json().catch(() => null);

      if (!res.ok || out?.success === false) {
        throw new Error(out?.message || `HTTP ${res.status}`);
      }

      toast.success("تم تعديل القسم بنجاح");
      router.push("/");
    } catch (e) {
      toast.error(`فشل التعديل: ${e?.message || e}`);
    }
  }

  return {
    loading,
    err,
    initial,
    handleSubmit,
    onCancel: () => router.back(),
  };
}
