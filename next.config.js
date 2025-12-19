/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  // Add server configuration for handling larger headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  if (!nextConfig["experimental"]) {
    nextConfig["experimental"] = {};
  }
        // NextJS 13.4.8 up to 14.1.3:
        // swcPlugins: [[require.resolve("tempo-devtools/swc/0.86"), {}]],
        // NextJS 14.1.3 to 14.2.11:
  nextConfig["experimental"].swcPlugins = [
    [require.resolve("tempo-devtools/swc/0.90"), {}],
  ];

        // NextJS 15+ (Not yet supported, coming soon)
}

module.exports = nextConfig;
