import { handleResponse, serverFetch } from "@/lib/api";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
  try {
    const { articleId } = params;
    // Just pass the relative path, the util handles the BASE_URL
    const res = await serverFetch(`/admin/articles/show/${articleId}`);
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { articleId } = params;
    const cookieStore = await cookies();
    const COOKIE_NAME = "edu_token";
    let token = cookieStore.get(COOKIE_NAME)?.value;

    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_API_URL غير مهيأ" },
        { status: 500 }
      );
    }

    // 1. Prepare FormData
    const form = await req.formData();
    const out = new FormData();
    for (const key of ["title", "date", "content", "status", "slug"]) {
      const v = form.get(key);
      if (v != null && v !== "") out.append(key, v);
    }
    const endpoint = `${base}/admin/articles/update/${articleId}`;

    // 2. First Attempt
    let res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: out,
      cache: "no-store",
    });

    // 3. Token Check & Refresh Logic
    if (res.status === 401) {
      console.log("⚠️ Token expired. Attempting refresh in Article Handler...");

      try {
        const refreshRes = await fetch(`${base}/refresh`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const refreshData = await refreshRes.json();
        const newToken = refreshData.data?.access_token;
        const expiresIn = refreshData.data?.expires_in;

        if (newToken) {
          console.log("✅ Token refreshed successfully.");

          // Update the cookie for the user
          cookieStore.set(COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: expiresIn || 60 * 60 * 24 * 7,
          });

          // Retry the request with the new token
          res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: out,
            cache: "no-store",
          });
        }
      } catch (refreshError) {
        console.error("Refresh flow failed:", refreshError);
      }
    }

    // 4. Final Response Handling
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "فشل تعديل المقال",
          errors: data?.errors,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل تعديل المقال" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { articleId } = params;
    const res = await serverFetch(`/admin/articles/delete/${articleId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
