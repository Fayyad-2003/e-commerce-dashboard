// app/api/ads/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/ads/show/${id}`, { method: "GET" });

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
        const { id } = params;
        const formData = await req.formData();

        const res = await serverFetch(`/admin/ads/update/${id}`, {
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

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        const res = await serverFetch(`/admin/ads/delete/${id}`, {
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
