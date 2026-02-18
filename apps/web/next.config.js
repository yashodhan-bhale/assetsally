/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@assetsally/shared", "@assetsally/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

module.exports = nextConfig;
