import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // No-op proxy: allow all routes to behave normally
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
