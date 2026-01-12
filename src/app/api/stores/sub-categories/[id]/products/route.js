import { backendClient } from "../../../../../../lib/api";
import { NextResponse } from "next/server";

// GET /api/stores/sub-categories/[id]/products
export async function GET(req, { params }) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const per_page = searchParams.get("per_page") || 10;
    const search = searchParams.get("search") || "";

    try {
        const res = await backendClient(`/admin/stores/sub-categories/${params.id}/products`, {
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
