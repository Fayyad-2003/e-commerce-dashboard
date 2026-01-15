import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/admin/store-products/show/${id}`, {
            method: "GET",
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
        const res = await serverFetch(`/admin/store-products/delete/${id}`, {
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

import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function POST(req, { params }) {
    try {
        const { id } = params;
        const formData = await req.formData();

        // Ensure we send as POST for Laravel update if needed, or PUT if strictly REST
        // The products route uses POST for update.
        const res = await serverFetch(`/admin/store-products/update/${id}`, {
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


