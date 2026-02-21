import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  devIndicators: false,
  images: {
    domains: ["https://gxdtcyyjkqltlnwjzncl.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gxdtcyyjkqltlnwjzncl.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
