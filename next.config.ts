import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cocktail.glass",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
