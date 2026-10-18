import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.platform === 'win32' ? undefined : 'standalone',
  outputFileTracingRoot: process.cwd(),
};

export default withNextIntl(nextConfig);
