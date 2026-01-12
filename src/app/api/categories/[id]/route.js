import { NextResponse } from "next/server";
import { serverFetch, handleResponse } from "@/lib/api";  // Import your utils

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get the Bearer token
function bearer(req) {
  const token = req.cookies.get("edu_token")?.value;
  return token ? `Bearer ${token}` : undefined;
}

export async function GET(req, { params }) {
  try {
    const token = bearer(req);
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const url = `/admin/categories/show/${id}`;
    
    // Use `serverFetch` to fetch the category details
    const res = await serverFetch(url, { method: "GET" });

    // Use `handleResponse` to handle the response
    return handleResponse(res);

  } catch (e) {
    return NextResponse.json({ success: false, message: e?.message || "Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const form = await req.formData();  // Handle form data
    const url = `/admin/categories/update/${id}`;
    
    // Use `serverFetch` to send the update request
    const res = await serverFetch(url, { method: "POST", body: form });

    // Use `handleResponse` to process the response
    return handleResponse(res);

  } catch (e) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const url = `/admin/categories/delete/${id}`;
    
    // Use `serverFetch` to send the delete request
    const res = await serverFetch(url, { method: "DELETE" });

    // Use `handleResponse` to process the response
    return handleResponse(res);

  } catch (e) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}