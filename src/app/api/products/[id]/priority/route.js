import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** POST — update product priority */
export async function POST(req, { params }) {
    try {
        const { id } = params || {};
        if (!id) return NextResponse.json({ success: false, message: "product id مفقود" }, { status: 400 });

        const body = await req.json();
        const { priority } = body;

        // We send priority in a JSON body to the backend
        const res = await serverFetch(`/admin/products/update-priority/${id}`, {
            method: "POST",
            body: JSON.stringify({ priority }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل تحديث الأولوية" }, { status: 500 });
    }
}
