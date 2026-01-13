// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  // Tutaj definiujesz, które ścieżki wymagają logowania
  // matcher: ["/dashboard/:path*", "/profile/:path*", "/settings"]
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], 
};