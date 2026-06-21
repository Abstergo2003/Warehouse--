import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import sql from "@/lib/db";
import { authConfig } from "./auth.config";

async function sendDiscordWebhook(user: { name: string; email: string }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL is not set. Discord authorization request will not be sent.");
    return;
  }

  const secret = process.env.REGISTRATION_SECRET || "default_secret_123";
  const baseUrl = process.env.AUTH_URL 
    ? process.env.AUTH_URL.replace(/\/api\/auth\/?$/, '') 
    : "http://localhost:3000";

  const approveUrl = `${baseUrl}/api/approve?email=${encodeURIComponent(user.email)}&action=approve&secret=${secret}`;
  const blockUrl = `${baseUrl}/api/approve?email=${encodeURIComponent(user.email)}&action=block&secret=${secret}`;

  console.log(`[Registration Request] User: ${user.email}`);
  console.log(`Approve Link: ${approveUrl}`);
  console.log(`Block Link: ${blockUrl}`);

  const message = {
    content: `🔒 **New Registration Request**

**Name:** ${user.name || 'N/A'}
**Email:** ${user.email}

**Actions:**
✅ **Approve User:** ${approveUrl}
🚫 **Block User:** ${blockUrl}`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      console.error(`❌ Failed to send Discord Webhook: ${response.statusText}`);
    } else {
      console.log(`✅ Discord Webhook sent successfully for ${user.email}`);
    }
  } catch (error) {
    console.error("❌ Error sending Discord webhook:", error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google],
  callbacks: {
    ...authConfig.callbacks,
    
    async signIn({ user, account }) {
      if (!user.email || !account) return false;
      const displayName = user.name || null;
      const email = user.email;
      const avatarUrl = user.image || null;
      const accessToken = account.access_token || null;
      const refreshToken = account.refresh_token || null;
      const expiresAt = account.expires_at || null;
      const provider = account.provider || null;
      const providerAccountId = account.providerAccountId || null;

      try {
        let dbUser = (await sql`SELECT id, status FROM users WHERE email = ${email}`)[0];

        if (!dbUser) {
          // Tworzymy nowego użytkownika ze statusem 'pending'
          dbUser = (await sql`
            INSERT INTO users (display_name, email, avatar_url, status)
            VALUES (${displayName}, ${email}, ${avatarUrl}, 'pending')
            RETURNING id, status
          `)[0];

          // Wysyłamy powiadomienie na Discord webhook
          await sendDiscordWebhook({ name: displayName || '', email });
        }

        // Sprawdzamy czy użytkownik jest zaakceptowany
        if (dbUser.status === 'approved') {
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
        }

        // Jeśli status to 'pending' lub 'blocked', odrzucamy logowanie (przekieruje na /login?error=AccessDenied)
        return false;
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