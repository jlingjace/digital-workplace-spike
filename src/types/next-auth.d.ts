import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/auth/permissions";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      deptId?: string | null;
    };
  }

  interface User {
    role?: AppRole;
    deptId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: AppRole;
    deptId?: string | null;
  }
}
