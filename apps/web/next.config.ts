import path from 'node:path';
import type { NextConfig } from 'next';

const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  experimental: {
    webpackBuildWorker: false,
  },
  rewrites() {
    const proxyRoutes = [
      '/auth/:path*',
      '/users/:path*',
      '/avatars/:path*',
      '/balances/:path*',
      '/api/:path*',
    ];

    return proxyRoutes.map((source) => ({
      source,
      destination: `${backendOrigin}${source}`,
    }));
  },
};

export default nextConfig;
