// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import sql from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      const displayName = user.name || null;
      const email = user.email || null;
      const avatarUrl = user.image || null;

      // Dla konta OIDC
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
    async session({ session, token }) {
      if (session.user && session.user.email) {
        const dbUser = await sql`
          SELECT id, display_name FROM users WHERE email = ${session.user.email}
        `;
        
        if (dbUser.length > 0) {
          session.user.id = dbUser[0].id;
          session.user.name = dbUser[0].display_name; 
        }
      }
      return session;
    },
  }
});