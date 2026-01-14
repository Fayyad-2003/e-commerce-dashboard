import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        const res = await serverFetch(`/admin/stores/show/${params.id}`, {
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
        const res = await serverFetch(`/admin/stores/${params.id}`, {
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
        const formData = await req.formData();

        // BranchForm sends 'image', but backend might expect 'logo' for stores
        if (formData.has("image") && !formData.has("logo")) {
            const img = formData.get("image");
            if (img) formData.append("logo", img);
        }

        const res = await serverFetch(`/admin/stores/update/${params.id}`, {
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
