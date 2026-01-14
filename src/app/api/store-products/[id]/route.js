import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — show one store product */
export async function GET(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-products/show/${id}`, { method: "GET" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل جلب المنتج" }, { status: 500 });
    }
}

/** POST/PUT — update store product */
export async function POST(req, { params }) {
    try {
        const { id } = params;
        const form = await req.formData();
        const res = await serverFetch(`/admin/store-products/update/${id}`, { method: "POST", body: form });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل تعديل المنتج" }, { status: 500 });
    }
}

/** DELETE — remove store product */
export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-products/delete/${id}`, { method: "DELETE" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل حذف المنتج" }, { status: 500 });
    }
}
