import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — list store sections */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const store_id = searchParams.get("store_id");

        let endpoint = `/admin/store-sections/index?page=${page}&per_page=${per_page}`;
        if (store_id) {
            endpoint = `/admin/store-sections/getByStore/${store_id}?page=${page}&per_page=${per_page}`;
        }

        const res = await serverFetch(endpoint, { method: "GET" });
        return handleResponse(res);
    } catch (err) {
        return NextResponse.json(
            { success: false, message: `استثناء: ${err?.message || err}` },
            { status: 500 }
        );
    }
}

/** POST — create store section */
export async function POST(req) {
    try {
        const formData = await req.formData();
        const res = await serverFetch("/admin/store-sections/store", {
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
