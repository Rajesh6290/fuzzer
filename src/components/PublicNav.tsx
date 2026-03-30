"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Docs", href: "/docs" },
];

export default function PublicNav({
  activePage,
}: {
  activePage?: "home" | "docs";
}) {
  return (
    <nav
      className="flex items-center justify-between px-4 sm:px-8 py-2 sticky top-0 z-50"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(97,96,176,0.07)",
      }}
    >
      <Link href="/">
        <Image src="/logo.svg" alt="FuzzX Logo" width={120} height={40} />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive =
            (activePage === "docs" && label === "Docs") ||
            (activePage === "home" && label !== "Docs");
          return (
            <Link
              key={label}
              href={href}
              className="text-sm transition-colors"
              style={{
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Link href="/dashboard">
        <button className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-5">
          Launch App <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </nav>
  );
}
