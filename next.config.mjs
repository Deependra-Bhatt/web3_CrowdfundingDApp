/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.infura.io",
        pathname: "/**", // Allows any path on this domain
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
        pathname: "/**", // Allows any path on this domain
      },
      {
        protocol: "https",
        hostname: "green-real-sawfish-482.mypinata.cloud",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
