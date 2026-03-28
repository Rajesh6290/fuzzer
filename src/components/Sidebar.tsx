"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ScanText,
  Plus,
  FileBarChart2,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi,
  BookOpen,
  LogOut,
  User2,
} from "lucide-react";
import { useState, useEffect } from "react";

interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  timezone: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan/new", label: "New Scan", icon: Plus },
  { href: "/scans", label: "All Scans", icon: ScanText },
  { href: "/reports", label: "Reports", icon: FileBarChart2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://ipinfo.io/json")
      .then((r) => r.json())
      .then((data) => {
        if (data.ip) {
          setIpInfo({
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            org: data.org,
            timezone: data.timezone,
          });
        }
      })
      .catch(() => {
        /* silently ignore */
      });
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.username) setUsername(d.username);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative shrink-0 h-screen flex flex-col"
      style={{
        background: "#ffffff",
        borderRight: "1px solid var(--border)",
        boxShadow: "2px 0 8px rgba(97,96,176,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center gap-3 px-4 py-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {collapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}

        <AnimatePresence>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="FuzzX Logo"
                width={120}
                height={100}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        className="mx-2 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-lg"
        style={{
          background: "var(--primary-50)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <User2 className="w-3.5 h-3.5" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <span
                className="block text-xs font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {username ?? "…"}
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* IP Info / Status */}
      {collapsed ? (
        /* Collapsed: just the green online dot */
        <div className="flex justify-center mb-4">
          <div
            title="System Online"
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--primary-50)",
              border: "1px solid var(--border)",
            }}
          >
            <Activity
              className="w-3.5 h-3.5"
              style={{ color: "var(--green)" }}
            />
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-3 mx-2 mb-4 rounded-lg space-y-2"
            style={{
              background: "var(--primary-50)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Always show System Online */}
            <div className="flex items-center gap-1.5">
              <Activity
                className="w-3 h-3 shrink-0"
                style={{ color: "var(--green)" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--green)" }}
              >
                System Online
              </span>
            </div>
            {/* Show IP info when loaded */}
            {ipInfo && (
              <>
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className="w-3 h-3 shrink-0"
                    style={{ color: "var(--primary)" }}
                  />
                  <span
                    className="text-xs font-mono truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ipInfo.ip}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0 opacity-0" />
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {ipInfo.city}, {ipInfo.region}, {ipInfo.country}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi
                    className="w-3 h-3 shrink-0"
                    style={{ color: "var(--primary)" }}
                  />
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ipInfo.org.replace(/^AS\d+\s+/, "")}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all"
        style={{
          background: "var(--bg-card-hover)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
          boxShadow: "0 2px 8px rgba(97,96,176,0.12)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
