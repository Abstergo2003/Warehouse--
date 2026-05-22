import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import sql from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google],
  callbacks: {
    ...authConfig.callbacks,
    
    async signIn({ user, account }) {
      if (!user.email || !account) return false;
      const displayName = user.name || null;
      const email = user.email || null;
      const avatarUrl = user.image || null;
      const accessToken = account.access_token || null;
      const refreshToken = account.refresh_token || null;
      const expiresAt = account.expires_at || null;
      const provider = account.provider || null;
      const providerAccountId = account.providerAccountId || null;

      try {
        let dbUser = (await sql`SELECT id FROM users WHERE email = ${email}`)[0];

        if (!dbUser) {
          dbUser = (await sql`
            INSERT INTO users (display_name, email, avatar_url)
            VALUES (${displayName}, ${email}, ${avatarUrl})
            RETURNING id
          `)[0];
        }

        const existingAccount = await sql`
          SELECT id FROM oidc_accounts 
          WHERE provider = ${provider} AND oidc_sub = ${providerAccountId}
        `;

        if (existingAccount.length === 0) {
          await sql`
            INSERT INTO oidc_accounts (user_id, provider, oidc_sub, access_token, refresh_token, expires_at)
            VALUES (${dbUser.id}, ${provider}, ${providerAccountId}, ${accessToken}, ${refreshToken}, ${expiresAt})
          `;
        }
        return true;
      } catch (error) {
        console.error("Błąd podczas synchronizacji SQL z Google Auth:", error);
        return false;
      }
    },
    
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = (await sql`SELECT id, display_name FROM users WHERE email = ${user.email}`)[0];
          if (dbUser) {
            token.sub = dbUser.id;
            token.name = dbUser.display_name;
          }
        } catch (error) {
          console.error("Błąd JWT:", error);
        }
      }
      return token;
    }
  }
});