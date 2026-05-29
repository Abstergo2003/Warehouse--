export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login (login page)
     * - install (installation page)
     * - offline (offline fallback page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     * - manifest.json (PWA manifest)
     * - sw.js (Service worker file)
     */
    "/((?!api/auth|login|install|offline|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};