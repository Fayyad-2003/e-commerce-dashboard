import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const res = await serverFetch(`/admin/stores/show/${id}`, {
            method: "GET"
        });
        return handleResponse(res);
    } catch (err) {
        return NextResponse.json(
            { success: false, message: `استثناء: ${err?.message || err}` },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const res = await serverFetch(`/admin/stores/delete/${id}`, {
            method: "DELETE",
        });
        return handleResponse(res);
    } catch (err) {
        return NextResponse.json(
            { success: false, message: `استثناء: ${err?.message || err}` },
            { status: 500 }
        );
    }
}

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const formData = await req.formData();

        // BranchForm might send 'image', but backend expects 'logo'
        if (formData.has("image") && !formData.has("logo")) {
            const img = formData.get("image");
            if (img) formData.append("logo", img);
        }

        const res = await serverFetch(`/admin/stores/update/${id}`, {
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
