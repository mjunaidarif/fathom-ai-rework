import type { NextConfig } from "next";

// Static export so the same build deploys to Vercel, Netlify, or GitHub Pages.
// For a GitHub Pages *project* site the app is served under /<repo>, so set
// DEPLOY_TARGET=pages at build time to apply the basePath. Vercel/local need none.
const isPages = process.env.DEPLOY_TARGET === "pages";
const repo = "fathom-ai-rework";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isPages ? `/${repo}` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isPages ? `/${repo}` : "",
  },
};

export default nextConfig;
