import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Enable experimental features if needed
  },
  // Ensure proper headers for MCP protocol
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Api-Key, MCP-Session-Id',
          },
        ],
      },
    ]
  },
}

export default nextConfig
