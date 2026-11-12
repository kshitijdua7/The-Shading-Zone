/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Runs as a Node server (`npm run build && npm start`): the login system,
  // admin dashboard and lead inbox need API routes, so no static export.
  trailingSlash: true,

  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
