import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "./lib/auth/validate";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow access
  if (
    pathname.startsWith("/public") ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (
    pathname.startsWith("/dashboard/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/timeline") ||
    pathname.startsWith("/guardian") ||
    pathname.startsWith("/accounts") ||
    pathname.startsWith("/search")
  ) {
    const result = await validateSession();

    if (!result.isValid) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Keep a compatibility alias in case something imports the middleware symbol
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
