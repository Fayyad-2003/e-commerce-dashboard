import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const COOKIE_NAME = "edu_token"; // Or process.env.TOKEN_COOKIE
    let token = cookieStore.get(COOKIE_NAME)?.value;

    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_API_URL غير مهيأ" },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const categoryId = form.get("category_id");
    const name = form.get("name");

    if (!categoryId || !name) {
      return NextResponse.json(
        { success: false, message: "category_id و name مطلوبة" },
        { status: 422 }
      );
    }

    const endpoint = `${base}/admin/sub-categories/store`;

    // 1. First Attempt
    let res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
      cache: "no-store",
    });

    // 2. Check Logic (Handle 401 Unauthorized)
    if (res.status === 401) {
      console.log("⚠️ Token expired in Handler. Attempting refresh...");

      try {
        // Attempt to refresh token
        const refreshRes = await fetch(`${base}/refresh`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // Send the expired token
          },
        });

        const refreshData = await refreshRes.json();
        const newToken = refreshData.data?.access_token;
        const expiresIn = refreshData.data?.expires_in;

        if (newToken) {
          console.log("✅ Token refreshed inside Handler.");

          // A. Update the cookie immediately
          cookieStore.set(COOKIE_NAME, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: expiresIn || 60 * 60 * 24 * 7,
          });

          // B. Retry the *original* request with the new token
          res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: form, // Reuse the form data
            cache: "no-store",
          });
        }
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError);
        // If refresh fails, we proceed with the original 401 response
      }
    }

    // 3. Final Response Handling
    const data = await res.json().catch(() => null);

    // Check if the final response (after potential retry) is successful
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "فشل الطلب",
          errors: data?.errors,
        },

        { status: res.status }
      );
    }

    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e?.message || "فشل إنشاء القسم الفرعي" },
      { status: 500 }
    );
  }
}
