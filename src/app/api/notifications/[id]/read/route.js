// src/app/api/admin/notifications/[id]/read/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

const ENDPOINT = (id) => `/admin/notifications/${id}/read`;

export async function POST(_req, { params }) {
  try {
    const { id } = params;

    const res = await serverFetch(ENDPOINT(id), {
      method: "POST",
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل وسم الإشعار كمقروء" },
      { status: 500 }
    );
  }
}
