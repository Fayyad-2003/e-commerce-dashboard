import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** GET — list sub-categories by category */
export async function GET(req, { params }) {
  const { category } = params || {};
  if (!category) return NextResponse.json({ success: false, message: "Category param مفقود" }, { status: 400 });

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const per_page = url.searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/sub-categories/getByCategory/${category}?page=${page}&per_page=${per_page}`,
      { method: "GET" }
    );

    const payload = await res.json().catch(() => ({}));

    const normalized = {
      success: payload?.success ?? true,
      message: payload?.message ?? "",
      data: Array.isArray(payload?.data)
        ? payload.data.map((s) => ({
            id: s.id,
            name: s.name,
            image: s.full_image_url || s.image || "",
            images: s.full_image_url ? [s.full_image_url] : undefined,
            category_id: s.category_id,
          }))
        : [],
      meta: payload?.meta ?? null,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل جلب التصنيفات الفرعية" }, { status: 500 });
  }
}
