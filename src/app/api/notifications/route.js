// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — list notifications (delegates auth/base to serverFetch) */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/notifications/index?page=${page}&per_page=${per_page}`,
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
