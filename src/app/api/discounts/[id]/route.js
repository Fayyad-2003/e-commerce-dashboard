// app/api/discounts/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

export async function GET(req, { params }) {
  try {
    const { id } = params || {};
    const res = await serverFetch(`/admin/discounts/show/${id}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = params || {};
    const form = await req.formData();

    const out = new FormData();
    for (const key of ["name", "type", "value", "value_type", "min_order_total"]) {
      const v = form.get(key);
      if (v != null && v !== "") out.append(key, v);
    }

    const res = await serverFetch(`/admin/discounts/update/${id}`, {
      method: "POST",
      body: out, // serverFetch should forward FormData (do not set Content-Type)
    });

    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل تعديل الخصم" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params || {};
    const res = await serverFetch(`/admin/discounts/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
