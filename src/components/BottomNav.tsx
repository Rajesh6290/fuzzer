"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  ScanText,
  FileBarChart2,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scans", label: "Scans", icon: ScanText },
  { href: "/scan/new", label: "New", icon: Plus, primary: true },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background: "#ffffff",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -2px 12px rgba(97,96,176,0.10)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, primary }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));

        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isActive
                    ? "var(--primary)"
                    : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  boxShadow: "0 2px 8px rgba(97,96,176,0.35)",
                }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "var(--primary)" }}
              >
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Icon
                className="w-5 h-5"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}
              />
            </div>
            <span
              className="text-[10px] font-medium"
              style={{
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </span>
            {isActive && (
              <div
                className="absolute top-0 w-6 h-0.5 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
