import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const pathname = req.nextUrl.pathname;
      const isAdminPath = pathname.startsWith("/admin");
      const isAdminApiPath = pathname.startsWith("/api/admin");

      if (isAdminPath || isAdminApiPath) {
        // Require authenticated session for /admin/** and /api/admin/** routes
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
