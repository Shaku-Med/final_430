import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Add security headers to prevent iframe embedding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'"
          }
        ]
      }
    ];
  }
};

export default nextConfig;