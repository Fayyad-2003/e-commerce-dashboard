import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — list bundles */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/bundles/index?page=${page}&per_page=${per_page}`,
      { method: "GET" }
    );

    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

/** POST — create bundle (multipart/form-data) */
export async function POST(req) {
  try {
    const form = await req.formData();

    const res = await serverFetch(`/admin/bundles/store`, {
      method: "POST",
      // do not set Content-Type — serverFetch should forward FormData correctly
      body: form,
    });

    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "فشل إنشاء العرض" },
      { status: 500 }
    );
  }
}
