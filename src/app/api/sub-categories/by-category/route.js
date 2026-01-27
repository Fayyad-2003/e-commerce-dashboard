// app/api/sub-categories/route.js
import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";

/**
 * GET — accept ?category_id=... and return normalized list
 * (keeps the normalized response shape from your original handler)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "100";

    if (!categoryId) {
      return NextResponse.json({ success: false, message: "يجب إرسال category_id" }, { status: 400 });
    }

    const res = await serverFetch(
      `/admin/sub-categories/getByCategory/${encodeURIComponent(categoryId)} ${per_page === "all" ? "" : `?page=${page}&per_page=${per_page}`}`,
      { method: "GET" }
    );

    const payload = await res.clone().json().catch(() => null);

    if (!res.ok) {
      const raw = payload ?? { success: false };
      return NextResponse.json(raw, { status: res.status });
    }

    const normalized = {
      success: payload?.success ?? true,
      message: payload?.message ?? "",
      data: Array.isArray(payload?.data)
        ? payload.data.map((s) => ({
          id: s.id,
          name: s.name,
          image: s.full_image_url || s.image || "",
          category_id: s.category_id,
          created_at: s.created_at,
        }))
        : [],
      meta: payload?.meta ?? null,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
