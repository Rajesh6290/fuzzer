import { NextRequest, NextResponse } from "next/server";
import { decrypt, COOKIE_NAME } from "@/lib/session";

// Paths that don't require authentication
const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

// API paths that are always public (auth endpoints themselves)
const PUBLIC_API_PREFIXES = ["/api/auth/"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public pages and auth API endpoints
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = await decrypt(token);

  // Unauthenticated request to an API route → 401 JSON
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Unauthenticated request to an app page → redirect to /login
  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to visit /login or /signup → redirect to /dashboard
  // (handled above by PUBLIC_PATHS — but kept here for /login redirects if needed)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
