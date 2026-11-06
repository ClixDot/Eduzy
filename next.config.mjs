import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/support', destination: '/contact', permanent: true },
      { source: '/connect', destination: '/quick-contact', permanent: true },
      { source: '/about', destination: '/portfolio', permanent: true },
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
