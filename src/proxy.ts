import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Proxy (Next.js 16's renamed middleware) runs before routes render, so it's
// where /admin/* and /account/* get gated. Deliberately self-contained
// rather than importing src/lib/auth/session.ts — Proxy is meant to run
// isolated from the rest of the app.
const ADMIN_COOKIE = "admin_session";
const MEMBER_COOKIE = "member_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set — see .env.example");
  return new TextEncoder().encode(secret);
}

async function hasValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await hasValidSession(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname.startsWith("/account")) {
    const ok = await hasValidSession(request.cookies.get(MEMBER_COOKIE)?.value);
    if (!ok) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
