// app/api/units-of-measure/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — fetch one unit */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const res = await serverFetch(`/admin/units-of-measure/show/${id}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

/** POST — update unit (expects form-data) */
export async function POST(req, { params }) {
  try {
    const { id } = params;
    const body = await req.formData();

    const res = await serverFetch(`/admin/units-of-measure/update/${id}`, {
      method: "POST",
      body, // forward FormData
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

/** DELETE — delete unit */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const res = await serverFetch(`/admin/units-of-measure/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    console.error("Error during DELETE:", e);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
