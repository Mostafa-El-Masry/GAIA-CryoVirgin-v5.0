
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/archives", "/settings"];

export function middleware(req: NextRequest) {
  const session = req.cookies.get("gaia.session");

  const isProtected = PROTECTED_ROUTES.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/archives/:path*", "/settings/:path*"],
};
