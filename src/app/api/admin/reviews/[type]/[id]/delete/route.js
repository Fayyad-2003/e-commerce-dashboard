import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** DELETE — delete / reject review */
export async function DELETE(_req, { params }) {
    try {
        const { type, id } = params;
        // Assuming backend follows the same structure now
        const res = await serverFetch(`/admin/reviews/${type}/${id}/delete`, { method: "DELETE" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json(
            { success: false, message: e?.message || "فشل حذف/رفض التقييم" },
            { status: 500 }
        );
    }
}
