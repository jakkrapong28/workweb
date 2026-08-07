import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = token ? Boolean(await verifySessionToken(token)) : false;

  // The login page itself is public; everything else under /admin needs a session.
  const isLoginPage = pathname === "/admin/login";

  if (!authed && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in but visiting the login page → send to dashboard.
  if (authed && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/blogs";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect admin pages only; admin API routes do their own session check.
  matcher: ["/admin/:path*"],
};
