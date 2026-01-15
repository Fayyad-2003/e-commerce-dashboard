import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function POST(req) {
    try {
        const formData = await req.formData();

        const res = await serverFetch(`/admin/store-products/store`, {
            method: "POST",
            body: formData,
        });
        return handleResponse(res);
    } catch (err) {
        return NextResponse.json(
            { success: false, message: `استثناء: ${err?.message || err}` },
            { status: 500 }
        );
    }
}
