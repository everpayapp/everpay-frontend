import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Use your deployed backend by default (safe on Vercel/Render)
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
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
          if (!res.ok || !data?.creator?.username) return null;

          const creator = data.creator;

          // IMPORTANT: return username so NextAuth can store it in JWT/session
          return {
            id: creator.username,
            username: creator.username,
            email: creator.email,
            name: creator.profile_name || creator.username,
            role: creator.role || "creator",
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
      // On login, "user" is present — copy our custom fields into the token
      if (user) {
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.name = (user as any).name;
        token.email = (user as any).email;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose username + role on session.user
      (session.user as any).username = token.username;
      (session.user as any).role = token.role;

      // keep these consistent too
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;

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
