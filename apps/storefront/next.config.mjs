import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'node:url';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Prisma's query compiler ships a WASM file next to the generated client.
 * Vercel's output tracing does not detect that runtime read on its own, so the
 * file must be added explicitly to every traced route.
 */
const prismaClientTrace = [
  './node_modules/.prisma/client/*.wasm',
  './node_modules/.prisma/client/schema.prisma',
  '../../node_modules/.prisma/client/*.wasm',
  '../../node_modules/.prisma/client/schema.prisma',
  '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/*.wasm',
  '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/schema.prisma',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.platform === 'win32' ? undefined : 'standalone',
  outputFileTracingRoot: workspaceRoot,
  outputFileTracingIncludes: {
    '/**': prismaClientTrace,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
