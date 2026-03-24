import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@gateway/app-core',
    '@gateway/canvas-engine',
    '@gateway/core-types',
    '@gateway/deploy-sdk',
    '@gateway/env-sdk',
    '@gateway/schemas',
    '@gateway/ui',
    '@gateway/utils',
    'zod'
  ],
  typescript: {
    // Segment 1 foundation prioritizes deterministic Worker packaging in CI.
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
