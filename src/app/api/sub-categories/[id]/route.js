// app/api/sub-categories/[id]/route.js
import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";

/**
 * GET — fetch sub-categories by category id (path param)
 * DELETE — delete a sub-category
 */
export const dynamic = "force-dynamic";

export async function GET(req, { params } = {}) {
  try {
    const categoryId = params?.id;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "100";

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "يجب إرسال category_id (في المسار أو كـ ?id=)" },
        { status: 400 }
      );
    }

    // Call upstream via serverFetch (serverFetch attaches base URL + auth)
    const res = await serverFetch(
      `/admin/sub-categories/getByCategory/${encodeURIComponent(categoryId)}?page=${encodeURIComponent(
        page
      )}&per_page=${encodeURIComponent(per_page)}`,
      { method: "GET" }
    );

    // Read safely
    const rawText = await res.clone().text();
    let payload = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch {
      payload = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message || `خطأ من السيرفر الخارجي: ${res.status} ${res.statusText}`,
          upstream: payload ?? rawText ?? null,
        },
        { status: res.status || 502 }
      );
    }

    // Normalize rows into consistent shape (handles multiple backend shapes)
    const rows =
      Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];

    const meta = payload?.meta || payload?.data?.meta || null;

    const data = rows.map((s) => ({
      id: s?.id,
      name: s?.name,
      image: s?.full_image_url || s?.image_url || s?.image || "",
      category_id: s?.category_id ?? s?.categoryId ?? null,
      created_at: s?.created_at ?? null,
    }));

    return NextResponse.json(
      {
        success: payload?.success ?? true,
        message: payload?.message ?? "",
        data,
        meta,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء غير متوقع: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params } = {}) {
  try {
    const subCategoryId = params?.id;
    if (!subCategoryId) {
      return NextResponse.json(
        { success: false, message: "يجب إرسال sub_category_id (مسار أو ?id=)" },
        { status: 400 }
      );
    }

    const res = await serverFetch(`/admin/sub-categories/delete/${subCategoryId}`, { method: "DELETE" });

    const rawText = await res.clone().text();
    let payload = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch { }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message || `خطأ أثناء الحذف: ${res.status} ${res.statusText}`,
          upstream: payload ?? rawText ?? null,
        },
        { status: res.status || 502 }
      );
    }

    return NextResponse.json(
      {
        success: payload?.success ?? true,
        message: payload?.message ?? "تم حذف التصنيف الفرعي بنجاح",
        data: payload?.data ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء غير متوقع: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) { return updateHandler(req, params); }
export async function POST(req, { params }) { return updateHandler(req, params); }

async function updateHandler(req, { params } = {}) {
  try {
    const subCategoryId = params?.id;
    if (!subCategoryId) {
      return NextResponse.json({ success: false, message: "subCategory id مفقود" }, { status: 400 });
    }

    const form = await req.formData();
    const res = await serverFetch(`/admin/sub-categories/update/${subCategoryId}`, { method: "POST", body: form });

    const rawText = await res.clone().text();
    let payload = null;
    try {
      payload = rawText ? JSON.parse(rawText) : null;
    } catch { }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: payload?.message || `خطأ من السيرفر الخارجي: ${res.status} ${res.statusText}`,
          upstream: payload ?? rawText ?? null,
        },
        { status: res.status || 502 }
      );
    }

    return NextResponse.json(
      {
        success: payload?.success ?? true,
        message: payload?.message ?? "تم تعديل التصنيف الفرعي بنجاح",
        data: payload?.data ?? null,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء غير متوقع: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
