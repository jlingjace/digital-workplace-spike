import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import type { Adapter } from 'next-auth/adapters'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // Placeholder: Email magic link. Replaced by Google OAuth in BE-1 (SNOW-187).
    EmailProvider({
      server: process.env.EMAIL_SERVER || 'smtp://localhost:1025',
      from: process.env.EMAIL_FROM || 'noreply@digital-workplace.local',
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = user as typeof user & { role: UserRole; id: string }
        ;(session.user as typeof session.user & { id: string; role: UserRole }).id = dbUser.id
        ;(session.user as typeof session.user & { id: string; role: UserRole }).role =
          dbUser.role ?? UserRole.EMPLOYEE
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
