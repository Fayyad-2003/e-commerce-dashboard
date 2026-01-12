// app/api/bundles/[bundleId]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — show bundle */
export async function GET(req, { params }) {
  try {
    const { bundleId } = params || {};
    const res = await serverFetch(`/admin/bundles/show/${bundleId}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

/** POST — update bundle (multipart/form-data forwarded) */
export async function POST(req, { params }) {
  try {
    const { bundleId } = params || {};

    // Read incoming FormData and forward it (preserving repeated keys)
    const form = await req.formData();
    const out = new FormData();
    for (const [key, value] of form.entries()) {
      out.append(key, value);
    }

    const res = await serverFetch(`/admin/bundles/update/${bundleId}`, {
      method: "POST",
      body: out,
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل تعديل الباندل" },
      { status: 500 }
    );
  }
}

/** DELETE — delete bundle */
export async function DELETE(req, { params }) {
  try {
    const { bundleId } = params || {};
    const res = await serverFetch(`/admin/bundles/delete/${bundleId}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
