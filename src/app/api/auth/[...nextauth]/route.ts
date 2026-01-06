// ~/everpay-frontend/src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const backendUrl = process.env.NEXT_PUBLIC_API_URL!;
const ADMIN_EMAIL = "lee@everpayapp.co.uk";

type AppRole = "admin" | "creator";

type BackendCreator = {
  username: string;
  email: string;
  role: AppRole;
  profile_name?: string | null;
};

type AppToken = JWT & {
  username?: string;
  role?: AppRole;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.creator) return null;

        const creator = data.creator as BackendCreator;

        return {
          id: creator.username,
          email: creator.email,
          // These extra fields are OK at runtime; TS types are handled in callbacks via casting
          username: creator.username,
          role: creator.role,
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      const t = token as AppToken;

      // On initial sign-in, NextAuth passes "user"
      if (user) {
        const u = user as any; // runtime safe: our authorize() returns these fields
        t.username = u.username ?? t.username;
        t.role = u.role ?? t.role;
        t.email = u.email ?? t.email;
      }

      return t;
    },

    async session({ session, token }) {
      const t = token as AppToken;

      if (session.user) {
        (session.user as any).username = t.username;
        (session.user as any).role = t.role;
        session.user.email = (t.email as string) || session.user.email;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Keep redirects inside site
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;

      // Default post-login route:
      return `${baseUrl}/creator/dashboard`;
    },
  },

  pages: { signIn: "/login" },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
