import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Only admins can access /admin routes
    if (pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect everything except login, auth API, setup API and Next.js internals
  matcher: ["/((?!login|api/auth|api/setup|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
