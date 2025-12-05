/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT: Disable Turbopack (fixes the build crash)
  experimental: {
    turbo: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "html.tailus.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "bnzeu7t1st.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
