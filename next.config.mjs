/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export so the whole site can be dropped on any host (Vercel, Netlify,
  // S3, cPanel...). Remove `output` if you later add API routes / server actions
  // for the forms — see components/forms/README notes in lib/site.ts.
  output: 'export',
  trailingSlash: true,

  images: {
    // next/image optimisation is unavailable in a static export.
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
