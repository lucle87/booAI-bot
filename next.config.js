/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@stripe/crypto': false,
      '@farcaster/mini-app-solana': false,
    }
    return config
  },
}

module.exports = nextConfig