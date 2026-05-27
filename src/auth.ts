import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "@/env";

/**
 * Single-admin Auth.js setup.
 *
 * For a 7-person company with a non-public admin we use one master account
 * provisioned via env vars. Multi-user can be added later by switching to a
 * DB-backed users table and the Drizzle adapter.
 */

const Credz = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: env.AUTH_SECRET || "dev-only-do-not-use-in-prod",
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h
  pages: { signIn: "/admin/sign-in" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = Credz.safeParse(credentials);
        if (!parsed.success) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          console.warn("[auth] ADMIN_EMAIL or ADMIN_PASSWORD not set");
          return null;
        }

        const okEmail = parsed.data.email.toLowerCase() === adminEmail.toLowerCase();
        const okPassword = parsed.data.password === adminPassword;
        if (!okEmail || !okPassword) return null;

        return {
          id: "admin",
          email: adminEmail,
          name: "WSB Admin",
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isSignIn = request.nextUrl.pathname === "/admin/sign-in";
      if (!isAdminRoute || isSignIn) return true;
      return Boolean(auth?.user);
    },
  },
});
