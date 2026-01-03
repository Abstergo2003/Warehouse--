import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // UWAGA: Używaj tego tylko tymczasowo, by potwierdzić, że to błąd typów!
    ignoreBuildErrors: true,
  },
  output: "standalone",
  reactCompiler: true,
};

export default nextConfig;
