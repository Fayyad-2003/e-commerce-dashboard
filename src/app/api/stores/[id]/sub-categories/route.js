import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

// GET /api/stores/[id]/sub-categories
// This fetches "Sub-Categories" belonging to a Store (L3)
export async function GET(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const search = searchParams.get("search") || "";

        // Assuming endpoint on backend is /admin/stores/{id}/sub-categories
        // Or if it was /admin/stores/{id}/categories, we map it here.
        // Based on user request "stores sub categories", let's assume specific endpoint.
        const res = await serverFetch(
            `/admin/stores/${params.id}/sub-categories?page=${page}&per_page=${per_page}&search=${search}`,
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
