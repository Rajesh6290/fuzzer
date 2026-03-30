"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  User2,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavbarProps {
  title: string;
  subtitle?: string;
}

interface ScanAlert {
  id?: string;
  _id?: string;
  name: string;
  targetUrl: string;
  status: string;
  findings?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  createdAt: string;
}

const SEV_COLOR: Record<string, string> = {
  critical: "#b91c1c",
  high: "#c2410c",
  medium: "#b45309",
  low: "#15803d",
  info: "#4f4fa8",
};

export default function Navbar({ title, subtitle }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<ScanAlert[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    fetch("/api/scans?limit=10")
      .then((r) => r.json())
      .then((data) => {
        const scans: ScanAlert[] = Array.isArray(data)
          ? data
          : (data.scans ?? []);
        // only scans that have vulnerabilities or are completed
        setAlerts(scans.slice(0, 8));
      })
      .catch(() => {});
  }, [open]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const totalVulns = alerts.reduce(
    (sum, s) =>
      sum +
      (s.findings?.critical ?? 0) +
      (s.findings?.high ?? 0) +
      (s.findings?.medium ?? 0) +
      (s.findings?.low ?? 0),
    0,
  );

  return (
    <header
      className="flex items-center justify-between px-3 md:px-6 py-2 shrink-0"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "#ffffff",
      }}
    >
      {/* Title */}
      <div className="min-w-0 flex-1 mr-3">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base md:text-lg font-bold truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p
            className="text-xs mt-0.5 truncate hidden sm:block"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0" ref={panelRef}>
        <Link href="/scan/new" className="hidden md:block">
          <button className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" />
            New Scan
          </button>
        </Link>

        {/* User chip + Logout — full card on sm+, compact on mobile */}
        {/* Mobile: just avatar + logout icon */}
        <div className="flex sm:hidden items-center gap-1.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-dark, #4f4fa8))",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(97,96,176,0.3)",
            }}
          >
            {username ? (
              username.charAt(0).toUpperCase()
            ) : (
              <User2 className="w-3.5 h-3.5" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
            style={{
              color: "var(--danger)",
              background: "rgba(255,75,75,0.07)",
              border: "1px solid rgba(255,75,75,0.2)",
            }}
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop: full profile card */}
        <div
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            boxShadow: "0 1px 4px rgba(97,96,176,0.08)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-dark, #4f4fa8))",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(97,96,176,0.3)",
            }}
          >
            {username ? (
              username.charAt(0).toUpperCase()
            ) : (
              <User2 className="w-3.5 h-3.5" />
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col leading-none">
            <span
              className="text-xs font-bold max-w-28 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {username ?? "…"}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Tester
            </span>
          </div>

          {/* Divider */}
          <div
            className="w-px h-5 mx-0.5"
            style={{ background: "var(--border)" }}
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all"
            style={{ color: "var(--danger)", background: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,75,75,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>

        {/* Bell button */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all relative"
            style={{
              background: open ? "var(--primary-100)" : "var(--primary-50)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <Bell className="w-4 h-4" />
            {totalVulns > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#b91c1c" }}
              />
            )}
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-11 z-50 rounded-xl overflow-hidden"
                style={{
                  width: "min(320px, calc(100vw - 1.5rem))",
                  background: "#ffffff",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 32px rgba(97,96,176,0.13)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--primary-50)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bell
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--primary)" }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Recent Alerts
                    </span>
                    {totalVulns > 0 && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "#b91c1c", color: "#fff" }}
                      >
                        {totalVulns}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* List */}
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {alerts.length === 0 ? (
                    <div
                      className="py-10 text-center text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No recent scans
                    </div>
                  ) : (
                    alerts.map((scan) => {
                      const vulnCount =
                        (scan.findings?.critical ?? 0) +
                        (scan.findings?.high ?? 0) +
                        (scan.findings?.medium ?? 0) +
                        (scan.findings?.low ?? 0);
                      const critical = scan.findings?.critical ?? 0;
                      const high = scan.findings?.high ?? 0;
                      return (
                        <Link
                          key={scan.id ?? scan._id}
                          href={`/scan/${scan.id ?? scan._id}`}
                          onClick={() => setOpen(false)}
                        >
                          <div
                            className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                            style={{ borderBottom: "1px solid var(--border)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--primary-50)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div className="mt-0.5">
                              {vulnCount > 0 ? (
                                <AlertTriangle
                                  className="w-4 h-4"
                                  style={{
                                    color:
                                      critical > 0
                                        ? "#b91c1c"
                                        : high > 0
                                          ? "#c2410c"
                                          : "#b45309",
                                  }}
                                />
                              ) : scan.status === "completed" ? (
                                <CheckCircle
                                  className="w-4 h-4"
                                  style={{ color: "#15803d" }}
                                />
                              ) : (
                                <Clock
                                  className="w-4 h-4"
                                  style={{ color: "var(--text-muted)" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-xs font-medium truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {scan.name}
                              </div>
                              <div
                                className="text-xs mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {vulnCount > 0 ? (
                                  <span>
                                    {vulnCount} vuln{vulnCount !== 1 ? "s" : ""}
                                    {critical > 0 && (
                                      <span
                                        style={{ color: SEV_COLOR.critical }}
                                      >
                                        {" "}
                                        · {critical} critical
                                      </span>
                                    )}
                                    {high > 0 && (
                                      <span style={{ color: SEV_COLOR.high }}>
                                        {" "}
                                        · {high} high
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--text-muted)" }}>
                                    {scan.status === "completed"
                                      ? "Clean — no issues found"
                                      : scan.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <Link href="/scans" onClick={() => setOpen(false)}>
                  <div
                    className="px-4 py-2.5 text-xs text-center font-medium transition-colors"
                    style={{
                      color: "var(--primary)",
                      borderTop: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--primary-50)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    View all scans →
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
