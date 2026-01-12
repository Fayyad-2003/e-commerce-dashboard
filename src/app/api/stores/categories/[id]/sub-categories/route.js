import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

// GET /api/stores/categories/[id]/sub-categories
export async function GET(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const search = searchParams.get("search") || "";

        const res = await serverFetch(
            `/admin/stores/categories/${params.id}/sub-categories?page=${page}&per_page=${per_page}&search=${search}`,
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
