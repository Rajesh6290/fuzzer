"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  TrendingUp,
  ExternalLink,
  Plus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import AnimatedCounter from "@/components/AnimatedCounter";
import SeverityBadge from "@/components/SeverityBadge";
import type { StatsDoc, ScanDoc } from "@/types";

const STATUS_CONFIG = {
  completed: { color: "#16a34a", label: "Completed", icon: CheckCircle2 },
  running: { color: "#6160b0", label: "Running", icon: Activity },
  pending: { color: "#d97706", label: "Pending", icon: Clock },
  failed: { color: "#dc2626", label: "Failed", icon: AlertTriangle },
  stopped: { color: "#94a3b8", label: "Stopped", icon: Clock },
};

const SEV_COLORS = {
  critical: "#dc2626",
  high: "#c2410c",
  medium: "#d97706",
  low: "#6160b0",
  info: "#94a3b8",
};

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}44` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-black" style={{ color }}>
          <AnimatedCounter value={value} />
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats
    ? Object.entries(stats.findings)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          color: SEV_COLORS[key as keyof typeof SEV_COLORS],
        }))
    : [];

  const barData =
    stats?.topVulnTypes?.map((v) => ({
      name: v.type
        .replace("Cross-Site Scripting (XSS)", "XSS")
        .replace("Server-Side Request Forgery", "SSRF")
        .slice(0, 18),
      count: v.count,
    })) ?? [];

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--border-glow)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Navbar
        title="Dashboard"
        subtitle="Security overview and recent activity"
      />
      <PageWrapper>
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          <StatsCard
            label="Total Scans"
            value={stats?.totalScans ?? 0}
            icon={Activity}
            color="#6160b0"
            delay={0}
          />
          <StatsCard
            label="Completed"
            value={stats?.completedScans ?? 0}
            icon={CheckCircle2}
            color="#16a34a"
            delay={0.05}
          />
          <StatsCard
            label="Vulnerabilities"
            value={stats?.totalVulnerabilities ?? 0}
            icon={ShieldAlert}
            color="#c2410c"
            delay={0.1}
          />
          <StatsCard
            label="Critical"
            value={stats?.findings.critical ?? 0}
            icon={AlertTriangle}
            color="#dc2626"
            delay={0.15}
          />
          <StatsCard
            label="High"
            value={stats?.findings.high ?? 0}
            icon={TrendingUp}
            color="#c2410c"
            delay={0.2}
          />
          <StatsCard
            label="Running Now"
            value={stats?.runningScans ?? 0}
            icon={Activity}
            color="#8188d3"
            delay={0.25}
          />
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          {/* Recent scans */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold">Recent Scans</h2>
                <Link
                  href="/scans"
                  className="text-xs flex items-center gap-1 transition-colors hover:text-[#6160b0]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {!stats?.recentScans?.length ? (
                <div className="glass-card p-12 text-center">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p style={{ color: "var(--text-secondary)" }}>
                    No scans yet.
                  </p>
                  <Link href="/scan/new">
                    <button className="btn-outline mt-4 text-sm">
                      <Plus className="w-4 h-4" />
                      Start First Scan
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentScans.map((scan: ScanDoc, i: number) => {
                    const cfg =
                      STATUS_CONFIG[scan.status] ?? STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    const total =
                      (scan.findings?.critical ?? 0) +
                      (scan.findings?.high ?? 0) +
                      (scan.findings?.medium ?? 0) +
                      (scan.findings?.low ?? 0);
                    return (
                      <motion.div
                        key={scan._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="glass-card p-4 flex items-center gap-4"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: `${cfg.color}18`,
                            border: `1px solid ${cfg.color}44`,
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: cfg.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {scan.name}
                          </div>
                          <div
                            className="text-xs mt-0.5 truncate"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {scan.targetUrl}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {total > 0 &&
                            (() => {
                              const worst =
                                (scan.findings?.critical ?? 0) > 0
                                  ? "critical"
                                  : (scan.findings?.high ?? 0) > 0
                                    ? "high"
                                    : (scan.findings?.medium ?? 0) > 0
                                      ? "medium"
                                      : "low";
                              return (
                                <SeverityBadge
                                  severity={worst as import("@/types").Severity}
                                  size="sm"
                                />
                              );
                            })()}
                          <span
                            className="text-xs font-semibold"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <Link href={`/scan/${scan._id}`}>
                            <button
                              className="text-xs px-3 py-1.5 rounded transition-all"
                              style={{
                                color: "var(--cyan)",
                                background: "var(--cyan-dim)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              View
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Charts column */}
          <div className="space-y-6">
            {/* Severity pie */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-bold mb-4">Severity Distribution</h3>
              {pieData.length === 0 ? (
                <div
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No data yet
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "var(--text-primary)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: d.color }}
                        />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Top vuln types bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-5"
            >
              <h3 className="text-sm font-bold mb-4">
                Top Vulnerability Types
              </h3>
              {barData.length === 0 ? (
                <div
                  className="text-center py-8 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(0,212,255,0.08)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#barGrad)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6160b0" />
                        <stop offset="100%" stopColor="#48488b" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick start CTA if no scans */}
        {!stats?.totalScans && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 glass-card p-10 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "var(--cyan-dim)",
                border: "1px solid var(--border-glow)",
              }}
            >
              <ShieldAlert
                className="w-8 h-8"
                style={{ color: "var(--cyan)" }}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to FuzzX</h3>
            <p
              className="mb-6 max-w-md mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Start your first security scan to begin detecting vulnerabilities
              in your web applications.
            </p>
            <Link href="/scan/new">
              <button className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Your First Scan
              </button>
            </Link>
          </motion.div>
        )}
      </PageWrapper>
    </>
  );
}
