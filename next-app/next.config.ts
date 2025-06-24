import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pde-content-img.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
