import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

/** POST — create store product */
export async function POST(req) {
    try {
        const form = await req.formData();
        // Proxy to backend endpoint for store products
        const res = await serverFetch("/admin/store-products/store", {
            method: "POST",
            body: form
        });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json(
            { success: false, message: e?.message || "فشل إنشاء منتج المتجر" },
            { status: 500 }
        );
    }
}
