import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  userId: z.string(),
  role: z.string()
});

export const authOptions = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      type: "credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { userId, role } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { id: userId }
          });

          if (!user) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
};

export const { handlers, auth } = NextAuth(authOptions);
