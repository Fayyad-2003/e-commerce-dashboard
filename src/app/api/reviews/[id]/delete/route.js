// src/app/api/reviews/[id]/delete/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** DELETE — delete / reject review */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const res = await serverFetch(`/admin/reviews/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل حذف/رفض التقييم" },
      { status: 500 }
    );
  }
}
