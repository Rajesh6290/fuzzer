"use client";

import { use, useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  StopCircle,
  Download,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Info,
  Bug,
  Clock,
  Hash,
  Activity,
  CheckCircle2,
  XCircle,
  Terminal,
  Play,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import SeverityBadge from "@/components/SeverityBadge";
import type { ScanDoc, VulnerabilityDoc, Severity } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_STYLES = {
  running: {
    color: "#6160b0",
    bg: "var(--cyan-dim)",
    label: "Running",
    icon: Activity,
  },
  completed: {
    color: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
    label: "Completed",
    icon: CheckCircle2,
  },
  stopped: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    label: "Stopped",
    icon: XCircle,
  },
  failed: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    label: "Failed",
    icon: AlertTriangle,
  },
  pending: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    label: "Pending",
    icon: Clock,
  },
};

const SEV_COLORS: Record<Severity, string> = {
  critical: "#dc2626",
  high: "#c2410c",
  medium: "#d97706",
  low: "#6160b0",
  info: "#94a3b8",
};

function VulnCard({ vuln }: { vuln: VulnerabilityDoc }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${SEV_COLORS[vuln.severity]}33`,
        background: `${SEV_COLORS[vuln.severity]}08`,
      }}
    >
      <button
        className="w-full p-4 text-left flex items-center gap-3"
        onClick={() => setExpanded((e) => !e)}
      >
        <SeverityBadge severity={vuln.severity} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm">{vuln.type}</div>
            {vuln.confidence && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{
                  background:
                    vuln.confidence === "high"
                      ? "rgba(22,163,74,0.12)"
                      : vuln.confidence === "medium"
                        ? "rgba(234,179,8,0.12)"
                        : "rgba(156,163,175,0.12)",
                  color:
                    vuln.confidence === "high"
                      ? "#16a34a"
                      : vuln.confidence === "medium"
                        ? "#ca8a04"
                        : "var(--text-muted)",
                  border: `1px solid ${
                    vuln.confidence === "high"
                      ? "rgba(22,163,74,0.25)"
                      : vuln.confidence === "medium"
                        ? "rgba(234,179,8,0.25)"
                        : "rgba(156,163,175,0.2)"
                  }`,
                }}
              >
                {vuln.confidence} confidence
              </span>
            )}
          </div>
          <div
            className="text-xs mt-0.5 truncate font-mono"
            style={{ color: "var(--text-secondary)" }}
          >
            param: {vuln.parameter || "—"} | {vuln.method} | {vuln.statusCode}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {vuln.responseTime}ms
          </span>
          {expanded ? (
            <ChevronUp
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
          ) : (
            <ChevronDown
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div className="pt-4 space-y-3">
                <div>
                  <div
                    className="text-xs font-bold mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    URL
                  </div>
                  <div
                    className="text-xs font-mono p-2 rounded break-all"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--cyan)",
                    }}
                  >
                    {vuln.url}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs font-bold mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Payload
                  </div>
                  <div
                    className="text-xs font-mono p-2 rounded break-all"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "#c2410c",
                    }}
                  >
                    {vuln.payload}
                  </div>
                </div>
                {vuln.evidence && (
                  <div>
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Evidence
                    </div>
                    <div
                      className="text-xs font-mono p-2 rounded break-all"
                      style={{
                        background: "var(--bg-secondary)",
                        color: "#f59e0b",
                      }}
                    >
                      {vuln.evidence}
                    </div>
                  </div>
                )}
                {vuln.description && (
                  <div>
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Description
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {vuln.description}
                    </p>
                  </div>
                )}
                {vuln.recommendation && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      background: "rgba(22,163,74,0.06)",
                      border: "1px solid rgba(22,163,74,0.2)",
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: "#16a34a" }}
                    >
                      Recommendation
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {vuln.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ScanResultsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [scan, setScan] = useState<ScanDoc | null>(null);
  const [vulns, setVulns] = useState<VulnerabilityDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "vulns" | "logs">(
    "overview",
  );
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [stopping, setStopping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const fetchScan = useCallback(async () => {
    try {
      const res = await fetch(`/api/scans/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setScan(data.scan);
      setVulns(data.vulnerabilities ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Poll while running
  useEffect(() => {
    if (scan?.status === "running" || scan?.status === "pending") {
      pollRef.current = setTimeout(() => fetchScan(), 2500);
    }

    // Fire Swal when scan just finished
    if (prevStatusRef.current === "running" && scan?.status === "completed") {
      const totalVulns = vulns.length;
      Swal.fire({
        title: "Scan Complete!",
        html:
          totalVulns > 0
            ? `Found <strong style="color:#c2410c">${totalVulns} vulnerabilit${totalVulns !== 1 ? "ies" : "y"}</strong> across ${scan.completedRequests ?? 0} requests.`
            : `No vulnerabilities found across ${scan.completedRequests ?? 0} requests.`,
        icon: totalVulns > 0 ? "warning" : "success",
        confirmButtonText: totalVulns > 0 ? "View Vulnerabilities" : "OK",
        background: "#ffffff",
        color: "#1e293b",
        confirmButtonColor: "#6160b0",
        timer: 6000,
        timerProgressBar: true,
      }).then((result) => {
        if (result.isConfirmed && totalVulns > 0) {
          setActiveTab("vulns");
        }
      });
    }

    prevStatusRef.current = scan?.status ?? null;

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [scan, fetchScan, vulns]);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === "logs") {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [scan?.logs, activeTab]);

  const stopScan = async () => {
    const confirmed = await Swal.fire({
      title: "Stop Scan?",
      text: "The current scan will be stopped and results saved.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Stop Scan",
      cancelButtonText: "Continue",
      background: "#ffffff",
      color: "#1e293b",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
      iconColor: "#f59e0b",
    });
    if (!confirmed.isConfirmed) return;

    setStopping(true);
    try {
      const res = await fetch(`/api/scans/${id}/stop`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to stop");
      }
      Swal.fire({
        title: "Scan Stopped",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1e293b",
      });
      fetchScan();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        background: "#ffffff",
        color: "#1e293b",
      });
    } finally {
      setStopping(false);
    }
  };

  const exportReport = () => {
    if (!scan) return;
    const report = {
      scan,
      vulnerabilities: vulns,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuzzx-report-${scan.name.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      title: "Report Exported!",
      text: "JSON report downloaded.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      background: "#ffffff",
      color: "#1e293b",
      iconColor: "#16a34a",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar title="Scan Results" />
        <div className="flex-1 flex items-center justify-center">
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
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar title="Scan Not Found" />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <XCircle className="w-16 h-16 opacity-30" />
          <p style={{ color: "var(--text-secondary)" }}>Scan not found.</p>
          <button className="btn-outline" onClick={() => router.push("/scans")}>
            Back to Scans
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_STYLES[scan.status] ?? STATUS_STYLES.pending;
  const StatusIcon = statusCfg.icon;

  const totalVulns = vulns.length;
  const filteredVulns =
    severityFilter === "all"
      ? vulns
      : vulns.filter((v) => v.severity === severityFilter);
  const findings = scan.findings ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "vulns", label: `Vulnerabilities (${totalVulns})`, icon: Bug },
    { id: "logs", label: "Activity Log", icon: Terminal },
  ] as const;

  return (
    <>
      <Navbar title={scan.name} subtitle={scan.targetUrl} />
      <PageWrapper>
        {/* Header */}
        <div className="glass-card p-5 mb-5 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: statusCfg.bg,
                border: `1px solid ${statusCfg.color}44`,
              }}
            >
              {scan.status === "running" ? (
                <div className="relative flex items-center justify-center">
                  <Activity
                    className="w-5 h-5"
                    style={{ color: statusCfg.color }}
                  />
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                    style={{ background: statusCfg.color }}
                  />
                </div>
              ) : (
                <StatusIcon
                  className="w-5 h-5"
                  style={{ color: statusCfg.color }}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate">{scan.name}</div>
              <div className="flex items-center gap-3 mt-0.5">
                <span
                  className="text-xs font-bold"
                  style={{ color: statusCfg.color }}
                >
                  {statusCfg.label}
                </span>
                {scan.status === "running" && (
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {scan.completedRequests}/{scan.totalRequests} requests
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {(scan.status === "running" || scan.status === "completed") && (
            <div className="w-full sm:w-48">
              <div
                className="flex justify-between text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>Progress</span>
                <span style={{ color: "var(--cyan)" }}>{scan.progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${scan.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {scan.status === "running" && (
              <button
                className="btn-danger text-sm"
                onClick={stopScan}
                disabled={stopping}
              >
                <StopCircle className="w-4 h-4" />
                {stopping ? "Stopping..." : "Stop"}
              </button>
            )}
            {(scan.status === "stopped" || scan.status === "failed") &&
              scan.completedRequests < scan.totalRequests && (
                <button
                  className="btn-primary text-sm"
                  onClick={async () => {
                    const res = await fetch(`/api/scans/${id}/start`, {
                      method: "POST",
                    });
                    if (res.ok) fetchScan();
                  }}
                >
                  <Play className="w-4 h-4" />
                  Resume ({scan.progress}% done)
                </button>
              )}
            {(scan.status === "completed" || scan.status === "stopped") && (
              <button className="btn-outline text-sm" onClick={exportReport}>
                <Download className="w-4 h-4" /> Export
              </button>
            )}
            <button
              className="btn-outline text-sm relative group"
              onClick={() => {
                setRefreshing(true);
                fetchScan();
              }}
              title="Refresh scan data"
              disabled={refreshing}
            >
              <RefreshCcw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                style={{ background: "var(--text-primary)", color: "#fff" }}
              >
                Refresh scan data
              </span>
            </button>
          </div>
        </div>

        {/* Current activity */}
        {scan.currentActivity && scan.status === "running" && (
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4 px-4 py-2.5 rounded-lg text-sm font-mono flex items-center gap-2"
            style={{
              background: "var(--cyan-dim)",
              border: "1px solid var(--border-glow)",
              color: "var(--cyan)",
            }}
          >
            <Activity className="w-4 h-4 shrink-0" />
            {scan.currentActivity}
          </motion.div>
        )}

        {/* Tabs */}
        <div
          className="flex gap-1 mb-5 p-1 rounded-xl w-fit"
          style={{ background: "var(--bg-secondary)" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isLogsTab = tab.id === "logs";
            const showPulse =
              isLogsTab && scan.status === "running" && !isActive;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? "var(--bg-card)" : "transparent",
                  color: isActive ? "var(--cyan)" : "var(--text-secondary)",
                  border: isActive
                    ? "1px solid var(--border-glow)"
                    : "1px solid transparent",
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {showPulse && (
                  <>
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping"
                      style={{ background: "var(--primary)", opacity: 0.6 }}
                    />
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview tab */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Severity cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(
                  ["critical", "high", "medium", "low", "info"] as Severity[]
                ).map((s) => {
                  const count = findings[s] ?? 0;
                  return (
                    <div
                      key={s}
                      className="glass-card p-4 flex flex-col items-center gap-1 cursor-pointer transition-all"
                      style={{
                        border: `1px solid ${SEV_COLORS[s]}33`,
                        background:
                          count > 0 ? SEV_COLORS[s] + "08" : undefined,
                      }}
                      onClick={() => {
                        setSeverityFilter(s);
                        setActiveTab("vulns");
                      }}
                      title={
                        count > 0 ? `View ${s} vulnerabilities` : undefined
                      }
                    >
                      <div
                        className="text-3xl font-black tabular-nums"
                        style={{ color: SEV_COLORS[s] }}
                      >
                        {count}
                      </div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: SEV_COLORS[s] }}
                      >
                        {s}
                      </div>
                      {count > 0 && (
                        <div
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          tap to view →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress stats */}
              <div className="glass-card p-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    {
                      label: "Planned",
                      value: scan.totalRequests,
                      color: "var(--primary)",
                    },
                    {
                      label: "Sent",
                      value: scan.completedRequests,
                      color: "var(--primary)",
                    },
                    {
                      label: "Vulns Found",
                      value: totalVulns,
                      color: totalVulns > 0 ? "#b91c1c" : "var(--text-muted)",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="rounded-lg p-3"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <div
                        className="text-xl font-black tabular-nums"
                        style={{ color }}
                      >
                        {value}
                      </div>
                      <div
                        className="text-[11px] mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Scan details */}
                <div className="glass-card p-5">
                  <h3
                    className="text-sm font-bold mb-4 flex items-center gap-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Shield
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--primary)" }}
                    />
                    Scan Configuration
                  </h3>
                  <div className="space-y-0">
                    {[
                      {
                        k: "Target URL",
                        v: scan.targetUrl,
                        mono: true,
                        copy: true,
                      },
                      { k: "HTTP Method", v: scan.method, badge: true },
                      { k: "Timeout", v: `${scan.timeout}s` },
                      {
                        k: "Max Payloads",
                        v: `${scan.maxPayloads} per attack type`,
                      },
                      {
                        k: "Follow Redirects",
                        v: scan.followRedirects ? "Yes" : "No",
                      },
                      { k: "Cookies", v: scan.cookies ? "Set" : "None" },
                    ].map(({ k, v, mono, badge }) => (
                      <div
                        key={k}
                        className="flex items-center justify-between py-2.5 gap-3"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <span
                          className="text-xs shrink-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {k}
                        </span>
                        {badge ? (
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded"
                            style={{
                              background: "rgba(97,96,176,0.12)",
                              color: "var(--primary)",
                            }}
                          >
                            {v}
                          </span>
                        ) : (
                          <span
                            className={`text-xs text-right truncate max-w-[55%] ${mono ? "font-mono" : ""}`}
                            style={{ color: "var(--text-primary)" }}
                            title={v ?? ""}
                          >
                            {v ?? "—"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timing + attack types */}
                <div className="space-y-4">
                  <div className="glass-card p-5">
                    <h3
                      className="text-sm font-bold mb-3 flex items-center gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Clock
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--primary)" }}
                      />
                      Timeline
                    </h3>
                    <div className="space-y-0">
                      {[
                        {
                          k: "Status",
                          v:
                            scan.status.charAt(0).toUpperCase() +
                            scan.status.slice(1),
                          color: (
                            STATUS_STYLES[
                              scan.status as keyof typeof STATUS_STYLES
                            ] ?? STATUS_STYLES.pending
                          ).color,
                        },
                        {
                          k: "Started",
                          v: scan.startedAt
                            ? new Date(scan.startedAt).toLocaleString()
                            : "—",
                        },
                        {
                          k: "Completed",
                          v: scan.completedAt
                            ? new Date(scan.completedAt).toLocaleString()
                            : scan.status === "running"
                              ? "In progress…"
                              : "—",
                        },
                        {
                          k: "Duration",
                          v: (() => {
                            const fmtDur = (ms: number) => {
                              const s = Math.round(ms / 1000);
                              if (s < 60) return `${s}sec`;
                              const m = Math.floor(s / 60),
                                r = s % 60;
                              return r > 0 ? `${m}min ${r}sec` : `${m}min`;
                            };
                            if (scan.startedAt && scan.completedAt)
                              return fmtDur(
                                new Date(scan.completedAt).getTime() -
                                  new Date(scan.startedAt).getTime(),
                              );
                            if (scan.startedAt && scan.status === "running")
                              return (
                                fmtDur(
                                  Date.now() -
                                    new Date(scan.startedAt).getTime(),
                                ) + " (running)"
                              );
                            return "—";
                          })(),
                        },
                      ].map(({ k, v, color }) => (
                        <div
                          key={k}
                          className="flex justify-between py-2 text-xs"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <span style={{ color: "var(--text-secondary)" }}>
                            {k}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: color ?? "var(--text-primary)" }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <h3
                      className="text-sm font-bold mb-3 flex items-center gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Bug
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--primary)" }}
                      />
                      Attack Types ({scan.attackTypes?.length ?? 0})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(scan.attackTypes ?? []).map((a: string) => {
                        const LABELS: Record<string, string> = {
                          sqli: "SQL Injection",
                          xss: "XSS",
                          path_traversal: "Path Traversal",
                          cmd_injection: "Command Injection",
                          ssrf: "SSRF",
                          open_redirect: "Open Redirect",
                          xxe: "XXE",
                          ldap: "LDAP",
                        };
                        return (
                          <span
                            key={a}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                            style={{
                              background: "var(--primary-50)",
                              color: "var(--primary)",
                              border: "1px solid var(--primary-200)",
                            }}
                          >
                            {LABELS[a] ?? a}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vulnerabilities tab */}
          {activeTab === "vulns" && (
            <motion.div
              key="vulns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Filter */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(
                  ["all", "critical", "high", "medium", "low", "info"] as const
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(s)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize"
                    style={{
                      background:
                        severityFilter === s
                          ? s === "all"
                            ? "var(--cyan-dim)"
                            : `${SEV_COLORS[s as Severity]}22`
                          : "var(--bg-secondary)",
                      color:
                        severityFilter === s
                          ? s === "all"
                            ? "var(--cyan)"
                            : SEV_COLORS[s as Severity]
                          : "var(--text-muted)",
                      border: `1px solid ${severityFilter === s ? (s === "all" ? "var(--border-glow)" : SEV_COLORS[s as Severity] + "55") : "var(--border)"}`,
                    }}
                  >
                    {s === "all"
                      ? `All (${totalVulns})`
                      : `${s} (${findings[s as Severity] ?? 0})`}
                  </button>
                ))}
              </div>

              {filteredVulns.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p style={{ color: "var(--text-secondary)" }}>
                    {totalVulns === 0 && scan.status !== "running"
                      ? "No vulnerabilities detected. The target appears to be secure against the tested payloads."
                      : totalVulns === 0
                        ? "Scanning in progress..."
                        : "No vulnerabilities match the selected filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVulns.map((v) => (
                    <VulnCard key={v._id} vuln={v} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Logs tab */}
          {activeTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "#f8f9fe",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 12px rgba(97,96,176,0.07)",
                }}
              >
                {/* Sticky terminal chrome header */}
                <div
                  className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5"
                  style={{
                    background: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    <span
                      className="ml-2 text-xs font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      fuzzx — activity log
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span style={{ color: "var(--text-muted)" }}>
                      {scan.name}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background:
                          scan.status === "running"
                            ? "rgba(97,96,176,0.12)"
                            : scan.status === "completed"
                              ? "rgba(22,163,74,0.12)"
                              : "rgba(148,163,184,0.12)",
                        color:
                          scan.status === "running"
                            ? "var(--primary)"
                            : scan.status === "completed"
                              ? "#15803d"
                              : "var(--text-muted)",
                      }}
                    >
                      {scan.status}
                    </span>
                  </div>
                </div>

                {/* Scan info panel */}
                {(() => {
                  // Parse injection points from the system log line
                  const injLog = (scan.logs ?? []).find((l) =>
                    l.includes("Injection points:"),
                  );
                  const injRaw = injLog
                    ? injLog.replace(/^.*Injection points:\s*/, "").trim()
                    : "";
                  const injPoints = injRaw
                    ? injRaw
                        .split(", ")
                        .map((p) => {
                          const [loc, name] = p.split(":");
                          return { loc: loc?.trim(), name: name?.trim() };
                        })
                        .filter((p) => p.loc && p.name)
                    : [];

                  const injCount =
                    injPoints.length ||
                    Math.round(
                      scan.totalRequests /
                        Math.max(scan.attackTypes?.length ?? 1, 1) /
                        Math.max(scan.maxPayloads, 1),
                    );

                  const ATTACK_LABELS: Record<string, string> = {
                    sqli: "SQLi",
                    xss: "XSS",
                    path_traversal: "Path Traversal",
                    cmd_injection: "CMDi",
                    ssrf: "SSRF",
                    open_redirect: "Open Redirect",
                    xxe: "XXE",
                    ldap: "LDAP",
                  };
                  const LOC_COLORS: Record<string, string> = {
                    query: "#0891b2",
                    body: "#7c3aed",
                    header: "#b45309",
                  };

                  return (
                    <div style={{ borderBottom: "1px solid var(--border)" }}>
                      {/* Formula row */}
                      <div
                        className="px-4 py-2 flex flex-wrap items-center gap-2 text-xs font-mono"
                        style={{ background: "var(--primary-50)" }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>
                          total =
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: "var(--primary)" }}
                        >
                          {scan.attackTypes?.length ?? 0} attacks
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>×</span>
                        <span
                          className="font-bold"
                          style={{ color: "#b45309" }}
                        >
                          {injCount} params
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>×</span>
                        <span
                          className="font-bold"
                          style={{ color: "#15803d" }}
                        >
                          {scan.maxPayloads} payloads
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>=</span>
                        <span
                          className="font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {scan.totalRequests} requests
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          <div
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: "rgba(97,96,176,0.10)",
                              color: "var(--primary)",
                            }}
                          >
                            {scan.completedRequests}/{scan.totalRequests} done
                          </div>
                          <div
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: "rgba(97,96,176,0.10)",
                              color: "var(--primary)",
                            }}
                          >
                            {scan.progress}%
                          </div>
                        </div>
                      </div>

                      {/* Attack types + injection points row */}
                      <div
                        className="px-4 py-2 flex flex-wrap gap-3 text-xs"
                        style={{ background: "var(--bg-card)" }}
                      >
                        {/* Attack types */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wide"
                            style={{ color: "var(--text-muted)" }}
                          >
                            attacks:
                          </span>
                          {(scan.attackTypes ?? []).map((a: string) => (
                            <span
                              key={a}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(97,96,176,0.10)",
                                color: "var(--primary)",
                                border: "1px solid rgba(97,96,176,0.2)",
                              }}
                            >
                              {ATTACK_LABELS[a] ?? a}
                            </span>
                          ))}
                        </div>

                        <div
                          className="w-px self-stretch"
                          style={{ background: "var(--border)" }}
                        />

                        {/* Injection points */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wide"
                            style={{ color: "var(--text-muted)" }}
                          >
                            params:
                          </span>
                          {injPoints.length > 0 ? (
                            injPoints.map((p, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                                style={{
                                  background:
                                    (LOC_COLORS[p.loc] ?? "#64748b") + "15",
                                  border: `1px solid ${LOC_COLORS[p.loc] ?? "#64748b"}33`,
                                }}
                              >
                                <span
                                  style={{
                                    color: LOC_COLORS[p.loc] ?? "#64748b",
                                  }}
                                >
                                  {p.loc}
                                </span>
                                <span style={{ color: "var(--text-primary)" }}>
                                  {p.name}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span
                              className="text-[10px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              auto-detecting…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Log lines */}
                <div
                  className="p-3 space-y-0.5"
                  style={{
                    maxHeight: "55vh",
                    overflowY: "auto",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  {(scan.logs ?? []).map((log, i) => {
                    // Parse timestamp
                    const tsMatch = log.match(
                      /^\[(\d{4}-\d{2}-\d{2}T(\d{2}:\d{2}:\d{2}))\.\d+Z\]\s*/,
                    );
                    const timeStr = tsMatch ? tsMatch[2] : "";
                    const body = tsMatch ? log.slice(tsMatch[0].length) : log;

                    // Parse tag [OK] [ERR] [CRITICAL] etc
                    const tagMatch = body.match(
                      /^\[(CRITICAL|HIGH|MEDIUM|LOW|INFO|ERR|OK)\]\s*/i,
                    );
                    const tag = tagMatch ? tagMatch[1].toUpperCase() : null;
                    const rest = tagMatch
                      ? body.slice(tagMatch[0].length)
                      : body;

                    // Parse all key=value pairs separated by |
                    const segments = rest.split(/\s*\|\s*/);
                    const fields: Record<string, string> = {};
                    const nonFields: string[] = [];
                    segments.forEach((seg) => {
                      const eqIdx = seg.indexOf("=");
                      if (eqIdx > 0) {
                        const k = seg.slice(0, eqIdx).trim();
                        const v = seg.slice(eqIdx + 1).trim();
                        fields[k] = v;
                      } else {
                        nonFields.push(seg.trim());
                      }
                    });

                    const isVuln =
                      tag &&
                      ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(tag);
                    const isErr = tag === "ERR";
                    const isOk = tag === "OK";
                    const isSystem = !tag;
                    const isVulnerable =
                      fields.VULNERABLE !== undefined ||
                      rest.includes("VULNERABLE");
                    const isClean =
                      fields.clean !== undefined || rest.includes("clean");

                    const tagColors: Record<string, string> = {
                      CRITICAL: "#b91c1c",
                      HIGH: "#c2410c",
                      MEDIUM: "#b45309",
                      LOW: "#4f4fa8",
                      INFO: "#5c62b5",
                      ERR: "#991b1b",
                      OK: "#15803d",
                    };
                    const tagColor = tag ? tagColors[tag] : "#6b7280";
                    const tagBg = tag ? tagColor + "14" : "transparent";

                    const statusCode = fields["status"]
                      ? parseInt(fields["status"])
                      : null;
                    const statusColor = statusCode
                      ? statusCode >= 500
                        ? "#b91c1c"
                        : statusCode >= 400
                          ? "#b45309"
                          : statusCode >= 300
                            ? "#4f4fa8"
                            : "#15803d"
                      : "#64748b";

                    const methodColors: Record<string, string> = {
                      GET: "#15803d",
                      POST: "#4f4fa8",
                      PUT: "#b45309",
                      DELETE: "#b91c1c",
                      PATCH: "#6b7280",
                    };
                    const methodColor = fields["method"]
                      ? (methodColors[fields["method"]] ?? "#64748b")
                      : "#64748b";

                    const locColors: Record<string, string> = {
                      query: "#0891b2",
                      body: "#7c3aed",
                      header: "#b45309",
                    };
                    const locColor = fields["loc"]
                      ? (locColors[fields["loc"]] ?? "#64748b")
                      : "#64748b";

                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md px-2 py-1 text-[11px] leading-5 border-l-2"
                        style={{
                          borderLeftColor: isVuln
                            ? tagColor
                            : isErr
                              ? "#991b1b"
                              : isOk && isVulnerable
                                ? "#b91c1c"
                                : "transparent",
                          background: isVuln
                            ? tagColor + "0a"
                            : isErr
                              ? "rgba(153,27,27,0.05)"
                              : "transparent",
                        }}
                      >
                        {/* Time — fixed width, never wraps */}
                        <span
                          className="shrink-0 tabular-nums"
                          style={{ color: "#94a3b8", width: 56 }}
                        >
                          {timeStr}
                        </span>

                        {/* All content tokens — wraps independently of timestamp */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                          {/* Tag badge */}
                          {tag && (
                            <span
                              className="shrink-0 font-bold text-[10px] px-1.5 rounded"
                              style={{
                                color: tagColor,
                                background: tagBg,
                                border: `1px solid ${tagColor}44`,
                                lineHeight: "18px",
                              }}
                            >
                              {tag}
                            </span>
                          )}

                          {/* Method pill */}
                          {fields["method"] && (
                            <span
                              className="shrink-0 font-bold text-[10px] px-1.5 rounded"
                              style={{
                                color: methodColor,
                                background: methodColor + "18",
                                lineHeight: "18px",
                              }}
                            >
                              {fields["method"]}
                            </span>
                          )}

                          {/* URL */}
                          {fields["url"] && (
                            <span
                              className="font-mono break-all"
                              style={{ color: "#334155" }}
                            >
                              {fields["url"]}
                            </span>
                          )}

                          {/* System messages (no fields) */}
                          {isSystem && nonFields.length > 0 && (
                            <span style={{ color: "#5c62b5" }}>
                              {nonFields.join(" | ")}
                            </span>
                          )}

                          {/* Param */}
                          {fields["param"] && (
                            <span className="inline-flex items-center gap-0.5">
                              <span style={{ color: "#94a3b8" }}>param=</span>
                              <span
                                className="font-bold"
                                style={{ color: "#4f4fa8" }}
                              >
                                {fields["param"]}
                              </span>
                            </span>
                          )}

                          {/* Location */}
                          {fields["loc"] && (
                            <span
                              className="shrink-0 text-[10px] px-1.5 rounded font-semibold"
                              style={{
                                color: locColor,
                                background: locColor + "18",
                                lineHeight: "18px",
                              }}
                            >
                              {fields["loc"]}
                            </span>
                          )}

                          {/* Payload */}
                          {fields["payload"] && (
                            <span className="inline-flex items-center gap-0.5 flex-wrap">
                              <span style={{ color: "#94a3b8" }}>payload=</span>
                              <span
                                className="font-mono break-all px-1 rounded"
                                style={{
                                  color: isVuln ? tagColor : "#c2410c",
                                  background:
                                    (isVuln ? tagColor : "#c2410c") + "12",
                                }}
                              >
                                {fields["payload"]}
                              </span>
                            </span>
                          )}

                          {/* Error message */}
                          {fields["error"] && (
                            <span
                              className="break-all"
                              style={{ color: "#991b1b" }}
                            >
                              ✗ {fields["error"]}
                            </span>
                          )}

                          {/* Status code */}
                          {fields["status"] && (
                            <span
                              className="shrink-0 font-bold tabular-nums"
                              style={{ color: statusColor }}
                            >
                              {fields["status"]}
                            </span>
                          )}

                          {/* Response time */}
                          {Object.keys(fields).find((k) =>
                            k.match(/^\d+ms$/),
                          ) && (
                            <span
                              className="shrink-0 tabular-nums"
                              style={{ color: "#94a3b8" }}
                            >
                              {Object.keys(fields).find((k) =>
                                k.match(/^\d+ms$/),
                              )}
                            </span>
                          )}
                          {nonFields
                            .filter((f) => f.match(/^\d+ms$/))
                            .map((f, fi) => (
                              <span
                                key={fi}
                                className="shrink-0 tabular-nums"
                                style={{ color: "#94a3b8" }}
                              >
                                {f}
                              </span>
                            ))}

                          {/* Result badge */}
                          {isVulnerable && (
                            <span
                              className="shrink-0 font-bold text-[10px] px-1.5 rounded"
                              style={{
                                color: "#b91c1c",
                                background: "rgba(185,28,28,0.12)",
                                border: "1px solid rgba(185,28,28,0.3)",
                                lineHeight: "18px",
                              }}
                            >
                              ⚠ VULNERABLE
                            </span>
                          )}
                          {isClean && (
                            <span
                              className="shrink-0 text-[10px] px-1.5 rounded"
                              style={{ color: "#94a3b8", lineHeight: "18px" }}
                            >
                              ✓ clean
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {scan.status === "running" && (
                    <div
                      className="cursor-blink text-xs font-mono mt-1 px-2"
                      style={{ color: "var(--primary)" }}
                    >
                      &nbsp;
                    </div>
                  )}
                  {scan.status === "stopped" && (
                    <div
                      className="text-xs font-mono mt-2 pt-2 px-2"
                      style={{
                        color: "#6b7280",
                        borderTop: "1px dashed var(--border)",
                      }}
                    >
                      [■] scan terminated — {scan.completedRequests} requests
                      sent
                    </div>
                  )}
                  {scan.status === "completed" && (
                    <div
                      className="text-xs font-mono mt-2 pt-2 px-2"
                      style={{
                        color: "#15803d",
                        borderTop: "1px dashed var(--border)",
                      }}
                    >
                      [✓] scan complete — {vulns.length} vulnerabilities found
                      across {scan.completedRequests} requests
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </>
  );
}
