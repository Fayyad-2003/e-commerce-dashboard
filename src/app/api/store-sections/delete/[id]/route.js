import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function DELETE(req, { params }) {
    try {
        const res = await serverFetch(`/store-sections/delete/${params.id}`, {
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
