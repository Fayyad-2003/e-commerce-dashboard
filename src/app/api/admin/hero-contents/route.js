import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";

export async function GET() {
    try {
        const url = `/admin/hero-contents/index`;
        const res = await serverFetch(url, { method: "GET" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "Error fetching hero content" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const form = await req.formData();
        const url = `/admin/hero-contents/store`;
        const res = await serverFetch(url, { method: "POST", body: form });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "Error updating hero content" }, { status: 500 });
    }
}
