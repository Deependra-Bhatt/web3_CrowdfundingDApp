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
        // Note: The Pinata cloud domain often contains a dynamic part (like the subdomain).
        // If the subdomain is always static (like 'green-real-sawfish-482'), this is correct.
        // If it can change, you might need a hostname wildcard like '*.mypinata.cloud'
        // which requires manually implementing a wildcard solution or using the experimental option.
        // For now, we'll keep the specific hostname you provided:
        hostname: "green-real-sawfish-482.mypinata.cloud",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
