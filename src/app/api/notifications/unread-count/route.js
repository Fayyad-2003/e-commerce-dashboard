// app/api/notifications/unread-count/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await serverFetch(`/admin/notifications/unread-count`, { method: "GET" });

    // Read upstream JSON (safely)
    const payload = await res.clone().json().catch(() => null);

    // Let handleResponse handle errors consistently
    if (!res.ok) return handleResponse(res);

    const normalized = {
      success: payload?.success ?? true,
      message: payload?.message ?? "",
      data: {
        count: payload?.data?.count ?? 0,
      },
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `استثناء: ${err?.message || err}`,
        data: { count: 0 },
      },
      { status: 500 }
    );
  }
}
