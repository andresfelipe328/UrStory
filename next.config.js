const STUDIO_REWRITE = {
  source: "/studio/:path*",
  destination:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3333/studio/:path*"
      : "/studio/index.html",
};

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  rewrites: () => [STUDIO_REWRITE],
  images: {
    domains: [
      'firebasestorage.googleapis.com',
    ]
  }
}