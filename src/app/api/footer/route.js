// app/api/footers/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

/** GET — fetch footer */
export async function GET(req) {
  try {
    const res = await serverFetch(`/admin/footers`, { method: "GET" });
    // We want to normalize the payload shape like your original handler did.
    // handleResponse will return the upstream payload; we still need to map it.
    const upstream = await res.clone().json().catch(() => null);

    if (!res.ok) {
      // let handleResponse produce the proper NextResponse for errors
      return handleResponse(res);
    }

    const payload = upstream ?? {};
    const normalized = {
      success: payload?.success ?? true,
      message: payload?.message ?? "",
      data: payload?.data
        ? {
            id: payload.data.id,
            address: payload.data.address || "",
            phone: payload.data.phone || "",
            email: payload.data.email || "",
            google_link: payload.data.google_link || "",
            facebook_link: payload.data.facebook_link || "",
            x_link: payload.data.x_link || "",
            instagram_link: payload.data.instagram_link || "",
            created_at: payload.data.created_at || null,
            updated_at: payload.data.updated_at || null,
          }
        : null,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

/** POST — create or update footer (FormData) */
export async function POST(req) {
  try {
    const form = await req.formData();

    const res = await serverFetch(`/admin/footers/store`, {
      method: "POST",
      // do not set Content-Type — serverFetch should forward FormData correctly
      body: form,
    });

    // Let handleResponse normalize success/error to NextResponse
    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "فشل إنشاء/تحديث الفوتر" },
      { status: 500 }
    );
  }
}
