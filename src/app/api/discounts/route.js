import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — Fetch discounts list */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/discounts/index?page=${page}&per_page=${per_page}`,
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

/** POST — Create new discount */
export async function POST(req) {
  try {
    const formData = await req.formData();

    const res = await serverFetch(`/admin/discounts/store`, {
      method: "POST",
      body: formData,
    });

    return handleResponse(res);
  } catch (err) {
    console.error("Discount POST error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
