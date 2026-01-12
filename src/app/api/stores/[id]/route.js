import { backendClient } from "../../../../../lib/api";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const res = await backendClient(`/admin/stores/${params.id}`);
        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: error.response?.status || 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const res = await backendClient.delete(`/admin/stores/${params.id}`, {
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

export async function POST(req, { params }) {
    // Usually for UPDATE (PUT/PATCH), but using POST with _method or direct POST for FormData handling in some backends
    try {
        const formData = await req.formData();
        // Append _method=PUT if your backend requires it for FormData updates
        // formData.append("_method", "PUT"); 

        const res = await backendClient.post(`/admin/stores/${params.id}`, formData, {
            headers: {
                Authorization: req.headers.get("Authorization"),
                "Content-Type": "multipart/form-data",
            },
        });
        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message, errors: error.response?.data?.errors },
            { status: error.response?.status || 500 }
        );
    }
}
