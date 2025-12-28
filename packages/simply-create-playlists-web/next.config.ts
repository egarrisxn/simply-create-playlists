import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['playlist-core'],
  allowedDevOrigins: ["127.0.0.1", "192.168.1.176"],
};

export default nextConfig;
