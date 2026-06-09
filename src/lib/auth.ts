import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import type { AppRole } from "@/lib/auth/permissions";

const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "yourcompany.com";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Safe because we enforce domain validation in signIn callback below.
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;

      const email = profile?.email;
      if (!email) return false;

      // Reject non-company-domain accounts
      if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        return `/auth/error?error=AccessDenied&hint=domain`;
      }

      return true;
    },

    async jwt({ token, user }) {
      // user is only defined on the initial sign-in; fetch role/dept from DB
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, deptId: true },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role as AppRole;
          token.deptId = dbUser.deptId ?? null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as AppRole;
        session.user.deptId = (token.deptId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
    error: "/auth/error",
  },
};
