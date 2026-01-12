import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** GET — show single sub-category */
export async function GET(req, { params }) {
  const { id } = params || {};
  if (!id) return NextResponse.json({ success: false, message: "subCategory id مفقود" }, { status: 400 });

  try {
    const res = await serverFetch(`/admin/sub-categories/show/${id}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل جلب التصنيف الفرعي" }, { status: 500 });
  }
}

/** PUT/POST — update sub-category */
export async function PUT(req, { params }) { return updateHandler(req, params); }
export async function POST(req, { params }) { return updateHandler(req, params); }

async function updateHandler(req, params) {
  const { id } = params || {};
  if (!id) return NextResponse.json({ success: false, message: "subCategory id مفقود" }, { status: 400 });

  try {
    const form = await req.formData();
    const res = await serverFetch(`/admin/sub-categories/update/${id}`, { method: "POST", body: form });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل تعديل التصنيف الفرعي" }, { status: 500 });
  }
}

/** DELETE — remove sub-category */
export async function DELETE(req, { params }) {
  const { id } = params || {};
  if (!id) return NextResponse.json({ success: false, message: "subCategory id مفقود" }, { status: 400 });

  try {
    const res = await serverFetch(`/admin/sub-categories/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل حذف التصنيف الفرعي" }, { status: 500 });
  }
}
