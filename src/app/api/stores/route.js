import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "10";
        const search = searchParams.get("search") || "";
        const category_id = searchParams.get("category_id") || "";

        const endpoint = `/admin/stores/getByCategory/${category_id}?page=${page}&per_page=${per_page}`;

        const res = await serverFetch(endpoint, { method: "GET" });

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

        // BranchForm sends 'image', but backend might expect 'logo' for stores
        if (formData.has("image") && !formData.has("logo")) {
            const img = formData.get("image");
            if (img) formData.append("logo", img);
        }

        const res = await serverFetch("/admin/stores/store", {
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
