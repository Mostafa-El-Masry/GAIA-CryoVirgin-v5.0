import { NextRequest, NextResponse } from "next/server";

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const PUBLIC_FILE =
  /\.(?:css|js|json|map|txt|xml|ico|png|jpe?g|gif|svg|webp)$/i;

const PROTECTED = ["/dashboard", "/archives", "/settings"];
const ADMIN = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Auth checks first
  const session = request.cookies.get("gaia.session");
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const needsAdmin = ADMIN.some((p) => pathname.startsWith(p));

  if ((needsAuth || needsAdmin) && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.json" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!MOBILE_UA.test(userAgent)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(redirectUrl);
}

// Keep a compatibility alias in case something imports the middleware symbol
export const middleware = proxy;

export const config = {
  matcher: "/:path*",
};
