import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const search = searchParams.get("search") || "";
        const category_id = searchParams.get("category_id") || "";

        const res = await serverFetch(
            `/admin/stores/index?page=${page}&per_page=${per_page}&search=${search}&category_id=${category_id}`,
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

export async function POST(req) {
    try {
        const formData = await req.formData();
        const res = await serverFetch("/admin/stores", {
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
