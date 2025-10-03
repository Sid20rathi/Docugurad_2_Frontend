/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes 'fs' module not found error for libraries like tiff.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;