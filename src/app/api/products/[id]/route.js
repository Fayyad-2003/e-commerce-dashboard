import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** GET — show one product */
export async function GET(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) return NextResponse.json({ success: false, message: "product id مفقود" }, { status: 400 });

    const res = await serverFetch(`/admin/products/show/${id}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل جلب المنتج" }, { status: 500 });
  }
}

/** POST/PUT — update product */
export async function POST(req, { params }) { return updateHandler(req, params); }
export async function PUT(req, { params }) { return updateHandler(req, params); }

async function updateHandler(req, params) {
  try {
    const { id } = params || {};
    if (!id) return NextResponse.json({ success: false, message: "product id مفقود" }, { status: 400 });

    const form = await req.formData();
    const res = await serverFetch(`/admin/products/update/${id}`, { method: "POST", body: form }); // Laravel-style POST for update
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل تعديل المنتج" }, { status: 500 });
  }
}

/** DELETE — remove product */
export async function DELETE(req, { params }) {
  try {
    const { id } = params || {};
    if (!id) return NextResponse.json({ success: false, message: "product id مفقود" }, { status: 400 });

    const res = await serverFetch(`/admin/products/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل حذف المنتج" }, { status: 500 });
  }
}
