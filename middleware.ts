import { NextResponse } from "next/server";

export function middleware() {
  // Custom session cookie (`oriiko_session`) is validated server-side via getCurrentUser().
  // Protected route guards (e.g. /admin) can inspect the cookie here when added.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
