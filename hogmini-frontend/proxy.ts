import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow assets, API, Next internals, and the waitlist itself
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/waitlist") ||
    pathname.startsWith("/oauth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.includes(".") // allow static files like sw, robots, etc.
  ) {
    return NextResponse.next();
  }

  // Redirect everything else to /waitlist
  const url = request.nextUrl.clone();
  url.pathname = "/waitlist";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/:path*",
};
