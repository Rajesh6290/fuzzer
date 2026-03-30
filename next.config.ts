import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent DNS prefetch leaking info about subresources
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS for 2 years, include subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent page from being embedded in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict access to browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline for hydration scripts
      "script-src 'self' 'unsafe-inline'",
      // Tailwind/framer-motion inject inline styles at runtime
      "style-src 'self' 'unsafe-inline'",
      // Allow data URIs and blobs for image handling
      "img-src 'self' data: blob:",
      // next/font self-hosts fonts
      "font-src 'self'",
      // API calls only to same origin
      "connect-src 'self'",
      // Prevent embedding in any frame
      "frame-ancestors 'none'",
      // Prevent base tag hijacking
      "base-uri 'self'",
      // Form submissions only to same origin
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
