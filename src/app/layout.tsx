import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://fuzzx.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "FuzzX — Web Application Security Fuzzer",
    template: "%s | FuzzX",
  },
  description:
    "FuzzX is a professional-grade web application fuzzer that automatically detects SQL injection, XSS, path traversal, command injection, SSRF, SSTI, NoSQL, and more with real-time results and severity-rated reports.",
  keywords: [
    "web application fuzzer",
    "security scanner",
    "penetration testing",
    "SQL injection",
    "XSS scanner",
    "OWASP Top 10",
    "vulnerability scanner",
    "bug bounty",
    "web security",
    "SSRF",
    "command injection",
    "path traversal",
  ],
  authors: [{ name: "FuzzX" }],
  creator: "FuzzX",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "FuzzX",
    title: "FuzzX — Web Application Security Fuzzer",
    description:
      "Automatically detect SQL injection, XSS, SSRF, command injection, and 7 more attack types with real-time results and severity-rated reports.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FuzzX — Web Application Security Fuzzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FuzzX — Web Application Security Fuzzer",
    description:
      "Automatically detect SQL injection, XSS, SSRF, command injection, and more with real-time results.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "FuzzX",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Web",
              description:
                "Professional web application security fuzzer. Automatically detects SQL injection, XSS, SSRF, command injection, path traversal, SSTI, NoSQL injection, and more.",
              url: BASE_URL,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "SQL Injection Detection",
                "Cross-Site Scripting (XSS)",
                "Server-Side Request Forgery (SSRF)",
                "Command Injection",
                "Path Traversal",
                "SSTI Detection",
                "NoSQL Injection",
                "GraphQL Security Testing",
                "LDAP Injection",
                "XXE Detection",
                "Open Redirect Detection",
                "Real-time Results",
                "Severity-rated Reports",
              ],
            }),
          }}
        />
        <NextTopLoader
          color="#6160b0"
          height={3}
          shadow="0 0 8px rgba(97,96,176,0.6)"
          showSpinner={false}
        />
        {children}
      </body>
    </html>
  );
}
