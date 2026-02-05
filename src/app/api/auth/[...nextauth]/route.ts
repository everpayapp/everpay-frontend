import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Server-side backend URL (Render)
const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL || // fallback (ok if you're relying on it)
  "https://everpay-backend.onrender.com";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json().catch(() => ({} as any));
          const creator = data?.creator;

          if (!res.ok || !creator?.username) return null;

          return {
            id: String(creator.username), // NextAuth expects a string id
            username: String(creator.username),
            email: String(creator.email || email),
            name: String(creator.profile_name || creator.username),
            role: String(creator.role || "creator"),
          } as any;
        } catch (e) {
          console.error("NextAuth authorize error:", e);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On login, copy custom fields into the token
      if (user) {
        const u = user as any;
        token.sub = String(u.id ?? u.username ?? token.sub ?? "");
        token.username = String(u.username ?? token.username ?? "");
        token.role = String(u.role ?? token.role ?? "creator");
        token.name = String(u.name ?? token.name ?? "");
        token.email = String(u.email ?? token.email ?? "");
      }

      // If username is missing but sub exists, backfill (helps older tokens)
      if (!token.username && token.sub) {
        token.username = String(token.sub);
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) session.user = {} as any;

      (session.user as any).username = token.username as string;
      (session.user as any).role = token.role as string;

      if (token.name) (session.user as any).name = token.name as string;
      if (token.email) (session.user as any).email = token.email as string;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
