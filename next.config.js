/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  transpilePackages: ["react-leaflet"],
  images: {
    remotePatterns: [],
  },
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
