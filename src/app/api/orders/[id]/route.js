// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const res = await serverFetch(`/admin/orders/show/${id}`, { method: "GET" });

    // Delegate error/success handling to handleResponse
    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
