import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@gateway/app-core',
    '@gateway/canvas-engine',
    '@gateway/core-types',
    '@gateway/deploy-sdk',
    '@gateway/env-sdk',
    '@gateway/schemas',
    '@gateway/ui',
    '@gateway/utils'
  ]
};

export default nextConfig;
