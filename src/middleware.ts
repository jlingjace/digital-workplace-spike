import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Authenticated but insufficient role → 403
    if (isAdminPath(req.nextUrl.pathname) && token?.role !== "PLATFORM_ADMIN") {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/403", req.url));
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Unauthenticated users on admin paths → redirect to sign-in
        if (isAdminPath(req.nextUrl.pathname)) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  // P0 fix: cover /api/admin/** in addition to /admin/**
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
