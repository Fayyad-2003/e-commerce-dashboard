// app/api/reviews/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** PUT — update review (Laravel-style POST + _method=PUT) */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const is_approved = body?.is_approved;

    const res = await serverFetch(`/admin/reviews/update/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _method: "PUT", is_approved }),
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "فشل التعديل" }, { status: 500 });
  }
}
