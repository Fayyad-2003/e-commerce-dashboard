// app/api/articles/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — list articles */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/articles/index?page=${page}&per_page=${per_page}`,
      { method: "GET" }
    );

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

/** POST — create article (FormData) */
export async function POST(req) {
  try {
    // receive FormData from frontend
    const form = await req.formData();

    const res = await serverFetch(`/admin/articles/store`, {
      method: "POST",
      // do not set Content-Type — serverFetch should forward FormData
      body: form,
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل إنشاء المقال" },
      { status: 500 }
    );
  }
}
