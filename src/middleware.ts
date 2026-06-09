import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      const isAdminPath = path.startsWith("/admin") || path.startsWith("/api/admin");
      if (isAdminPath) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
