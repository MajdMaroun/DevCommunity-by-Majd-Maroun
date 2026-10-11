import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongoClient";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login", error: "/login" },

  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const client = await clientPromise;
        const user = await client.db().collection("users").findOne({ email });
        if (!user || typeof user.password !== "string") return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          username: user.username ?? null,
        };
      },
    }),
  ],

  callbacks: {
    // Runs on every social login: save THIS user's provider photo
    async signIn({ user, account, profile }) {
      if (account && account.provider !== "credentials") {
        const picture = profile?.picture ?? profile?.avatar_url;
        if (picture && user?.email) {
          const client = await clientPromise;
          await client
            .db()
            .collection("users")
            .updateOne({ email: user.email }, { $set: { image: picture } });
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? null;
      }

      // Social login: take the photo straight from the provider
      if (account && account.provider !== "credentials") {
        token.picture =
          profile?.picture ?? profile?.avatar_url ?? user?.image ?? token.picture;
      }

      // Any user whose token has no photo yet: load it from their DB record
      if (token.id && !token.picture) {
        try {
          const client = await clientPromise;
          const dbUser = await client
            .db()
            .collection("users")
            .findOne({ _id: new ObjectId(token.id) });
          if (dbUser?.image) token.picture = dbUser.image;
          if (dbUser?.username) token.username = dbUser.username;
        } catch {
          /* invalid id: ignore */
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.username) token.username = session.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name ?? session.user.name;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
  },
});