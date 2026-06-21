import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnApprovePage = nextUrl.pathname.startsWith('/api/approve');

      if (isOnLoginPage || isOnApprovePage) {
        if (isOnLoginPage && isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      return isLoggedIn; 
    },
    // ------------------------------------

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;