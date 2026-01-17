import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Transpile shared package
  transpilePackages: ["@quantum-garden/shared"],
};

export default nextConfig;
