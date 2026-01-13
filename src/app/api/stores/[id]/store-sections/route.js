import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        // Await params if necessary (Next.js 15+ convention, though often auto-unwrapped in 14)
        // treating params as object here.
        const id = params?.id;

        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const search = searchParams.get("search") || "";

        const res = await serverFetch(
            `/admin/store-sections/getByStore/${id}?page=${page}&per_page=${per_page}&search=${search}`,
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
