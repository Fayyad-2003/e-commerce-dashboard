// app/api/customers/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — fetch customers list */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const res = await serverFetch(
      `/admin/customers/index?page=${page}&per_page=${per_page}`,
      { method: "GET" }
    );

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل جلب الزبائن" },
      { status: 500 }
    );
  }
}
