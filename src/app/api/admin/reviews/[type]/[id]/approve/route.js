import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** POST — approve review */
export async function POST(_req, { params }) {
    try {
        const { type, id } = params;
        // Assuming backend follows the same structure now
        const res = await serverFetch(`/admin/reviews/${type}/${id}/approve`, { method: "POST" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json(
            { success: false, message: e?.message || "فشل الموافقة على التقييم" },
            { status: 500 }
        );
    }
}
