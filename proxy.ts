import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isProtected = [
    "/dashboard",
    "/settings",
    "/timeline",
    "/guardian",
    "/accounts",
    "/search",
  ].some((path) => req.nextUrl.pathname.startsWith(path));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// Keep a compatibility alias in case something imports the middleware symbol
export const middleware = proxy;

export const config = {
  matcher: "/:path*",
};
