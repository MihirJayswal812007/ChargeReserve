import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "cr_token";

// Routes that need auth
const PROTECTED = ["/dashboard", "/reservations", "/booking", "/session"];
const OPERATOR_ONLY = ["/operator"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect auth-required routes
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url));
  }

  // Operator-only routes
  if (OPERATOR_ONLY.some((p) => pathname.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    if (user.role !== "OPERATOR" && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin-only routes
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!user) return NextResponse.redirect(new URL("/login", req.url));
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Inject user info into request headers for server components
  const response = NextResponse.next();
  if (user) {
    response.headers.set("x-user-id", user.userId);
    response.headers.set("x-user-role", user.role);
    response.headers.set("x-user-email", user.email);
    response.headers.set("x-user-name", user.name);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
