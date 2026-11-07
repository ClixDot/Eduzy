import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dev only: allow opening the dev server from another device / the LAN IP (e.g. http://192.168.0.124:3000)
  // so live reload (the /_next/hmr WebSocket) is not blocked. Has no effect on production builds.
  allowedDevOrigins: ['192.168.*.*'],
  images: {
    unoptimized: true,
    // website and CMS images are hosted on Cloudinary
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/wbckkjmc/**' }],
  },
  async redirects() {
    return [
      { source: '/support', destination: '/contact', permanent: true },
      { source: '/connect', destination: '/quick-contact', permanent: true },
      { source: '/why-choose-us', destination: '/portfolio', permanent: true },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      'react-router-dom': path.resolve(__dirname, './src/utils/navigation.tsx'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'react-router-dom': './src/utils/navigation.tsx',
    },
  },
};

export default nextConfig;
