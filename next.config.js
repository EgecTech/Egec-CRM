/** @type {import('next').NextConfig} */

// Bundle analyzer for performance monitoring (optional - install with: npm install @next/bundle-analyzer)
let withBundleAnalyzer = (config) => config;
try {
  withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
} catch (e) {
  console.log(
    "Bundle analyzer not installed. Run: npm install @next/bundle-analyzer --save-dev"
  );
}

const nextConfig = {
  // Remove console logs in production (except errors and warnings)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  images: {
    // Updated for Next.js 16 - use remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Reduced cache TTL for logo updates - change to 3600 (1 hour) when updating logo
    // After logo is updated everywhere, change back to 86400 (24 hours)
    minimumCacheTTL: process.env.LOGO_UPDATE_MODE === "true" ? 3600 : 86400, // 1 hour if updating, 24 hours normally
    // Prevent layout shift
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimize image loading
    unoptimized: false,
  },
  // Enable compression
  compress: true,
  // swcMinify is now default in Next.js 16 - removed
  // optimizeFonts is now default in Next.js 16 - removed
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false,

  // Security Headers
  async headers() {
    // Content Security Policy - comprehensive protection
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://res.cloudinary.com https://*.cloudinary.com;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://res.cloudinary.com https://*.cloudinary.com https://vitals.vercel-insights.com https://*.sentry.io wss://*.vercel.app;
      frame-src 'self';
      frame-ancestors 'self';
      form-action 'self';
      base-uri 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
        ],
      },
      // Stricter CSP for API routes (no inline scripts needed)
      // Note: We need to allow 'self' for API routes to work properly
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; frame-ancestors 'none'; script-src 'none'; object-src 'none'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      // Logo image cache control - shorter cache for easier updates
      {
        source: "/img/edugate_now_1-compressed.jpg",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.LOGO_UPDATE_MODE === "true"
                ? "public, max-age=3600, must-revalidate" // 1 hour when updating
                : "public, max-age=86400, immutable", // 24 hours normally
          },
        ],
      },
    ];
  },

  // Explicitly configure Turbopack to use webpack for builds
  // This prevents Turbopack errors in production builds
  turbopack: {},

  // Experimental features for better performance
  experimental: {
    // Optimize package imports - reduces bundle size by tree-shaking unused exports
    optimizePackageImports: ["react-icons", "react-markdown"],
  },

  // Webpack optimizations (simplified for production builds)
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production for client-side builds
    if (!dev && !isServer) {
      // Set deterministic module IDs for better caching
      if (config.optimization) {
        config.optimization.moduleIds = "deterministic";
      }
    }

    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Exclude playwright from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        playwright: "commonjs playwright",
      });
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

