// app/api/reports/route.js
import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "products"; // products | customers
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = searchParams.get("page") || "1";
    const per_page = searchParams.get("per_page") || "10";

    const path =
      tab === "customers"
        ? "/admin/reports/top-buying-customers"
        : "/admin/reports/top-selling-products";

    const params = new URLSearchParams();
    params.set("page", page);
    params.set("per_page", per_page);

    if (from) {
      params.set("from", from);
      params.set("start", from);
      params.set("start_date", from);
      params.set("from_date", from);
    }
    if (to) {
      params.set("to", to);
      params.set("end", to);
      params.set("end_date", to);
      params.set("to_date", to);
    }

    const query = params.toString();
    const res = await serverFetch(`${path}?${query}`, { method: "GET" });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      // preserve validation-style errors for the frontend
      return NextResponse.json(
        {
          success: false,
          message: body?.message || `Upstream error (HTTP ${res.status})`,
          errors: body?.errors || null,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: body?.message || "OK",
        data: body?.data ?? [],
        meta: body?.meta ?? null,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "Network error" },
      { status: 500 }
    );
  }
}
