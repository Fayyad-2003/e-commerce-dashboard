// app/api/orders/[id]/complete/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function POST(req, { params }) {
  try {
    const { id } = params;

    // Try to read JSON body if present, otherwise undefined
    let body = null;
    try {
      body = await req.json().catch(() => null);
    } catch {
      body = null;
    }

    const res = await serverFetch(`/admin/orders/${id}/confirm`, {
      method: "POST",
      // If there is a JSON body, we send JSON; otherwise an empty POST
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
