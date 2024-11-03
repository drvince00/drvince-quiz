/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, {
    isServer
  }) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    });

    return config;
  },
  images: {
    domains: ['raw.githubusercontent.com'],
  },
};

export default nextConfig;
