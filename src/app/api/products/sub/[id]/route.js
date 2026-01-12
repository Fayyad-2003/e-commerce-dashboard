import { handleResponse, serverFetch } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(req, ctx) {
  try {
    // Extract `id` from the URL parameters
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "subId مفقود في المسار" },
        { status: 400 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    // Build the API URL
    const url = `/admin/products/getBySubCategory/${id}?page=${page}&per_page=${per_page}`;

    // Use serverFetch to handle the request
    const res = await serverFetch(url, { method: "GET" });
    
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
