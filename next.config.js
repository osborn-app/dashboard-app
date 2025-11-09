/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Tambahkan ini untuk menghindari error Unknown module type
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source", // biar file .md dianggap teks biasa
    });
    return config;
  },

  // ✅ (Opsional tapi direkomendasikan untuk Turbo mode)
  experimental: {
    turbo: {
      rules: {
        "*.md": {
          loaders: ["raw"], // treat markdown files as plain text when using Turbopack
        },
      },
    },
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: "transgo",
  project: "dashboard-app",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: false,
});
