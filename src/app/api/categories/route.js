// app/api/categories/route.js
import { handleResponse, serverFetch } from "@/lib/api";
import { NextResponse } from "next/server";

// اختياري: اجبر المسار أن يكون ديناميكي (لا يُخزّن)
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    // Extract query params directly
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "100";

    const url = `/admin/categories/index?page=${page}&per_page=${per_page}`;

    // Use the serverFetch utility to fetch data
    const res = await serverFetch(url, { method: "GET" });

    // Use handleResponse to process the response
    return handleResponse(res);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `استثناء: ${err?.message || err}` },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Parse the incoming form data
    const form = await req.formData();
    const url = `/admin/categories/store`;

    // Use the serverFetch utility to send the form data
    const res = await serverFetch(url, { method: "POST", body: form });

    // Use handleResponse to process the response
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل إنشاء القسم" },
      { status: 500 }
    );
  }
}
