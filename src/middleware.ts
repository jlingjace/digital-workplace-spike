import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
      if (isAdminPath) {
        // Require authenticated session for all /admin/** routes
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
