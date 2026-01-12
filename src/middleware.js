// middleware.js (في جذر المشروع)
import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.TOKEN_COOKIE || "edu_token";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  console.log(pathname);

  const isLogin = pathname === "/auth/login";

  // امنع الوصول بدون توكن
  if (!token && !isLogin) {
    const url = new URL("/auth/login", req.url);
    return NextResponse.redirect(url);
  }

  // معه توكن وواقف على /login → للداشبورد
  if (token && isLogin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("[MW] ran on:", pathname);
  return NextResponse.next();
}

export const config = {
  // run middleware for everything except API/_next/static/_next/image/favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
