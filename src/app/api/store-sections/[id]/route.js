import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — show one store section */
export async function GET(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-sections/show/${id}`, { method: "GET" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل جلب القسم" }, { status: 500 });
    }
}

/** POST/PUT — update store section */
export async function POST(req, { params }) {
    try {
        const { id } = params;
        const form = await req.formData();
        const res = await serverFetch(`/admin/store-sections/update/${id}`, { method: "POST", body: form });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل تعديل القسم" }, { status: 500 });
    }
}

/** DELETE — remove store section */
export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-sections/delete/${id}`, { method: "DELETE" });
        return handleResponse(res);
    } catch (e) {
        return NextResponse.json({ success: false, message: e?.message || "فشل حذف القسم" }, { status: 500 });
    }
}
