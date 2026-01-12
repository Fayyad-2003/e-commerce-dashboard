import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** POST — create product */
export async function POST(req) {
  try {
    const form = await req.formData();
    const res = await serverFetch("/admin/products/store", { method: "POST", body: form });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل إنشاء المنتج" }, { status: 500 });
  }
}

/** GET — list products with query params */
export async function GET(req) {
  try {
    const res = await serverFetch(`/admin/products/index`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل جلب المنتجات" }, { status: 500 });
  }
}
