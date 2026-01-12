// next.config.js
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["backend.my-homestyle.com"], // أضف الدومين المستضيف للصور
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
};

module.exports = nextConfig;
