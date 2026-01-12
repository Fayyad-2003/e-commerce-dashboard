import { cookies } from "next/headers";

export async function POST(req) {
    try {
      const { email, password, remember = true } = await req.json();
      if (!email || !password) {
        return new Response(JSON.stringify({ message: "Email & password required" }), { status: 400 });
      }
  
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiBase}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || "Login failed";
        return new Response(JSON.stringify({ message: msg }), { status: res.status });
      }
  
      // المتوقع من لارفيل حسب الصورة: data.access_token
      const token = data?.data?.access_token || data?.access_token;
      if (!token) {
        return new Response(JSON.stringify({ message: "Token not found in response" }), { status: 500 });
      }
  
      // إعداد الكوكي
      const cookieName = process.env.TOKEN_COOKIE || "edu_token";
      const maxAge = remember ? 60 * 60 * 24 * 7 : undefined; // أسبوع أو جلسة
      const cookie = [
        `${cookieName}=${token}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        "Secure",        // خليه Secure ببيئة الإنتاج (HTTPS)
        maxAge ? `Max-Age=${maxAge}` : "",
      ].filter(Boolean).join("; ");
  
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
    }
  }
  



export async function logout() {
  const cookieStore = await cookies();
  const name = process.env.TOKEN_COOKIE || "edu_token";

  // مسح الكوكي محلياً
  cookieStore.set(name, "", { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 0 });

  // (اختياري) نادِ Laravel /logout لو متاح وبده توكن
  try {
    const token = cookieStore.get(name)?.value;
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    }
  } catch {}

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

