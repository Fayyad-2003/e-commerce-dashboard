// src/lib/api-client.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const COOKIE_NAME = process.env.TOKEN_COOKIE || "edu_token";

/**
 * Helper to get headers with Bearer token
 */
async function getAuthHeaders(token = null, isFormData = false) {
  const cookieStore = await cookies();
  const currentToken = token || cookieStore.get(COOKIE_NAME)?.value;

  const headers = {};

  // Do not set Content-Type for FormData (browser sets it with boundary)
  if (!isFormData) {
    headers["Accept"] = "application/json";
    // Optional: headers["Content-Type"] = "application/json";
  } else {
    headers["Accept"] = "application/json";
  }

  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  return headers;
}

/**
 * The Main Fetch Wrapper
 */
export async function serverFetch(endpoint, options = {}) {
  const cookieStore = await cookies();

  // 1. Prepare URL and Initial Headers
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  let headers = await getAuthHeaders(null, isFormData);

  // Merge custom headers if any
  if (options.headers) {
    headers = { ...headers, ...options.headers };
  }

  // 2. First Attempt
  let res = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  // 3. Handle 401 (Unauthorized) -> Refresh Token Logic
  if (res.status === 401) {
    console.log("⚠️ Token expired. Attempting refresh...");

    const refreshUrl = `${BASE_URL}/refresh`;

    // We try to refresh using the *expired* token (often required by backends)
    // or simply hit the endpoint if it relies on cookies.

    try {
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: headers["Authorization"],
        },
      });
      const refreshData = await refreshRes.json();

      // Based on your image, the new token is in data.access_token
      const newToken = refreshData.data?.access_token;
      const expiresIn = refreshData.data?.expires_in; // e.g. 300000

      if (newToken) {
        console.log("✅ Token refreshed successfully.");

        // A. Update the Cookie for the user (Crucial!)
        cookieStore.set(COOKIE_NAME, newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: expiresIn || 60 * 60 * 24 * 7, // Fallback 7 days
        });

        // B. Retry the *original* request with the new token
        const newHeaders = await getAuthHeaders(newToken, isFormData);

        res = await fetch(url, {
          ...options,
          headers: newHeaders,
          cache: "no-store",
        });
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  // 4. Handle 404 (User not found) -> Treat as Invalid Token
  if (res.status === 404) {
    const clone = res.clone(); // Clone to read body without consuming original
    const data = await clone.json().catch(() => ({}));

    if (data?.message === "User not found") {
      console.log("⚠️ User not found (token invalid or user deleted). Clearing token...");

      // Clear cookie
      cookieStore.delete(COOKIE_NAME);

      // Return 401 manually so frontend handles it as Auth error
      return NextResponse.json(
        { success: false, message: "Unauthenticated (User not found)" },
        { status: 401 }
      );
    }
  }

  return res;
}

/**
 * Standardized Response Helper
 * Handles parsing JSON and catching errors
 */
export async function handleResponse(res) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      {
        success: false,
        message: data?.message || `Error ${res.status}`,
        errors: data?.errors,
      },
      { status: res.status }
    );
  }

  return NextResponse.json(data || { success: true }, { status: 200 });
}
