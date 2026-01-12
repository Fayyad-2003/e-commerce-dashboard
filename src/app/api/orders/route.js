import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";
    const status = searchParams.get("status") || "";

    // append status only when provided
    const extra = status ? `&status=${encodeURIComponent(status)}` : "";

    const res = await serverFetch(
      `/admin/orders/index?page=${page}&per_page=${per_page}${extra}`,
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
