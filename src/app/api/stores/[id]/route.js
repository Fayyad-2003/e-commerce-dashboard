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
        const res = await serverFetch(`/admin/stores/delete/${params.id}`, {
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
        // Assuming update uses POST or PUT depending on backend. 
        // Ads update uses POST. Check if backend requires _method=PUT.
        // formData.append("_method", "PUT"); 

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
