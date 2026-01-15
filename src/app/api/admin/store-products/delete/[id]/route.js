import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function DELETE(req, { params }) {
    try {
        const { id } = params;
        const res = await serverFetch(`/store-products/delete/${id}`, {
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
