// app/api/customers/[id]/route.js
import { NextResponse } from "next/server";
import { handleResponse, serverFetch } from "@/lib/api";

/** GET — fetch specific customer details */
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "معرّف المستخدم غير موجود" },
        { status: 400 }
      );
    }

    const res = await serverFetch(`/admin/customers/show/${id}`, { method: "GET" });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل في جلب بيانات الزبون" },
      { status: 500 }
    );
  }
}

/** POST — update customer (FormData) */
export async function POST(req, { params }) {
  try {
    const { id } = params;

    // build filtered FormData like original
    const formData = await req.formData();
    const body = new FormData();
    ["name", "email", "phone", "password"].forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== "") {
        body.append(field, value);
      }
    });

    const res = await serverFetch(`/admin/customers/update/${id}`, {
      method: "POST",
      body, // serverFetch should forward FormData (do not set Content-Type)
    });

    return handleResponse(res);
  } catch (error) {
    console.error("❌ Update customer error:", error);
    return NextResponse.json(
      { success: false, message: "فشل في تحديث بيانات الزبون" },
      { status: 500 }
    );
  }
}

/** DELETE — delete customer */
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const res = await serverFetch(`/admin/customers/delete/${id}`, { method: "DELETE" });
    return handleResponse(res);
  } catch (error) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json(
      { success: false, message: "خطأ في الخادم." },
      { status: 500 }
    );
  }
}
