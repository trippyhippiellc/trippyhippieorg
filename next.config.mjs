

////////////////////////////////////////////////////////////////////
// NEXT.JS CONFIGURATION — C:\trippyhippieorg\next.config.ts
// Controls how Next.js builds, serves, and secures the application
////////////////////////////////////////////////////////////////////

const nextConfig = {

  ////////////////////////////////////////////////////////////////////
  // EXPERIMENTAL FEATURES
  // Server Actions enabled for form handling without client JS
  ////////////////////////////////////////////////////////////////////
  experimental: {
    serverActions: {
      // Allow server actions from our own domain + Supabase
      allowedOrigins: [
        "localhost:3000",
        "trippyhippie.org",
        "www.trippyhippie.org",
      ],
    },
  },

  ////////////////////////////////////////////////////////////////////
  // IMAGE OPTIMIZATION
  // Domains allowed to serve images through Next.js Image component.
  // Add your Supabase project URL here once created.
  // Format: <project-ref>.supabase.co
  ////////////////////////////////////////////////////////////////////
  images: {
    remotePatterns: [
      {
        // Supabase Storage — product images, ID uploads, COA docs (public URLs)
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Storage — signed URLs
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        // Supabase Storage alternate hostname (public)
        protocol: "https",
        hostname: "*.supabase.in",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Storage alternate hostname (signed)
        protocol: "https",
        hostname: "*.supabase.in",
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
    // Supported formats (WebP for performance, AVIF for cutting-edge)
    formats: ["image/webp", "image/avif"],
    // Default device widths for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  ////////////////////////////////////////////////////////////////////
  // SECURITY HEADERS
  // Applied to every response. These harden the site against:
  // - Clickjacking (X-Frame-Options)
  // - XSS (Content-Security-Policy)
  // - MIME sniffing (X-Content-Type-Options)
  // - Referrer leaking (Referrer-Policy)
  ////////////////////////////////////////////////////////////////////
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            // Strict Transport Security — forces HTTPS for 1 year
            // Only enable in production (breaks localhost HTTPS)
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  ////////////////////////////////////////////////////////////////////
  // REDIRECTS
  // Old URL patterns → new canonical URLs (301 permanent)
  // Add legacy paths here if you rename pages later
  ////////////////////////////////////////////////////////////////////
  async redirects() {
    return [
      // Redirect /store to /shop
      {
        source: "/store",
        destination: "/shop",
        permanent: true,
      },
      // Redirect /products/:id to /product/:id
      {
        source: "/products/:id",
        destination: "/product/:id",
        permanent: true,
      },
    ];
  },

  ////////////////////////////////////////////////////////////////////
  // TYPESCRIPT & ESLINT
  // During 'npm run build', these settings control error handling.
  // Set ignoreBuildErrors to true ONLY during active development.
  // Before going live, set both back to false.
  ////////////////////////////////////////////////////////////////////
  typescript: {
    // TODO: Set to false before going live
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: Set to false before going live
    ignoreDuringBuilds: true,
  },

  ////////////////////////////////////////////////////////////////////
  // ENVIRONMENT VARIABLE EXPOSURE
  // Variables prefixed NEXT_PUBLIC_ are auto-exposed to the browser.
  // Non-prefixed variables stay server-side only.
  // Do NOT add secret keys here.
  ////////////////////////////////////////////////////////////////////
  env: {
    NEXT_PUBLIC_SITE_NAME: "Trippy Hippie",
    NEXT_PUBLIC_CASHAPP_HANDLE: "$TrippyHippieSmoke",
  },

};

export default nextConfig;