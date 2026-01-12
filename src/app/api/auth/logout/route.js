import { NextResponse } from "next/server";

export async function POST(req) {
  const cookieName = process.env.TOKEN_COOKIE || "edu_token";

  // امسح الكوكي
  const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_HOSTING_URL}/auth/login`, { status: 303 });
  res.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  
  
  // (اختياري) نادِ لارفيل لتسجيل الخروج بالتوكن القديم إذا بتحب
  try {
    const token = req.cookies.get(cookieName)?.value;
    if (token) await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}

  return res;
}