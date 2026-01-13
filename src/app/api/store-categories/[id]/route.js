import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — show one store category */
export async function GET(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-categories/show/${id}`, { method: "GET" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل جلب تصنيف المتجر" }, { status: 500 });
    }
}

/** POST/PUT — update store category */
export async function POST(req, { params }) {
    try {
        const { id } = params;
        const form = await req.formData();
        // Laravel/PHP style update
        const res = await serverFetch(`/admin/store-categories/update/${id}`, { method: "POST", body: form });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل تعديل تصنيف المتجر" }, { status: 500 });
    }
}

/** DELETE — remove store category */
export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-categories/delete/${id}`, { method: "DELETE" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل حذف تصنيف المتجر" }, { status: 500 });
    }
}
