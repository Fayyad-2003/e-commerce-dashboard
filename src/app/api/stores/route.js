import { backendClient } from "../../../../lib/api";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const per_page = searchParams.get("per_page") || 10;
    const search = searchParams.get("search") || "";

    try {
        const res = await backendClient(`/admin/stores`, {
            params: { page, per_page, search },
            headers: {
                Authorization: req.headers.get("Authorization"),
            },
        });

        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const res = await backendClient.post("/admin/stores", formData, {
            headers: {
                Authorization: req.headers.get("Authorization"),
                "Content-Type": "multipart/form-data",
            },
        });

        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.response?.data?.message || error.message, errors: error.response?.data?.errors },
            { status: error.response?.status || 500 }
        );
    }
}
