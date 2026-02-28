/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['undici', '@firebase/functions', 'firebase'],
  experimental: {
    serverComponentsExternalPackages: ['undici']
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/undici/,
      use: {
        loader: 'next-swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'ecmascript',
              privateMethod: true
            }
          }
        }
      }
    });
    return config;
  },
};
export default nextConfig;
