"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Filter,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import type { ScanDoc } from "@/types";

const STATUS_CFG = {
  completed: { color: "#16a34a", label: "Completed", icon: CheckCircle2 },
  running: { color: "#6160b0", label: "Running", icon: Activity },
  pending: { color: "#d97706", label: "Pending", icon: Clock },
  failed: { color: "#dc2626", label: "Failed", icon: AlertTriangle },
  stopped: { color: "#94a3b8", label: "Stopped", icon: XCircle },
};

export default function ScansPage() {
  const [scans, setScans] = useState<ScanDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchScans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/scans?${params}`);
      const data = await res.json();
      setScans(data.scans ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [statusFilter]);

  const deleteScan = async (id: string, name: string) => {
    const confirmed = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "This will permanently delete the scan and all its vulnerability records.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      color: "#1e293b",
      confirmButtonColor: "#ff4b4b",
      cancelButtonColor: "#374151",
      iconColor: "#ff4b4b",
    });
    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");

      Swal.fire({
        title: "Deleted",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1e293b",
        iconColor: "#16a34a",
      });
      fetchScans();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        background: "#ffffff",
        color: "#1e293b",
      });
    }
  };

  const filtered = scans.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.targetUrl.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Navbar title="All Scans" subtitle={`${total} total scans`} />
      <PageWrapper>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex-1 min-w-48 relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="cyber-input pl-9"
              placeholder="Search scans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter
              className="w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            {["all", "running", "completed", "stopped", "failed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all"
                style={{
                  background:
                    statusFilter === s
                      ? "var(--cyan-dim)"
                      : "var(--bg-secondary)",
                  color:
                    statusFilter === s ? "var(--cyan)" : "var(--text-muted)",
                  border: `1px solid ${statusFilter === s ? "var(--border-glow)" : "var(--border)"}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <Link href="/scan/new">
            <button className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
              New Scan
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "var(--border-glow)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p style={{ color: "var(--text-secondary)" }}>
              {scans.length === 0
                ? "No scans yet. Create your first scan to get started."
                : "No scans match your filter."}
            </p>
            {scans.length === 0 && (
              <Link href="/scan/new">
                <button className="btn-primary mt-4 text-sm">
                  <Plus className="w-4 h-4" />
                  New Scan
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((scan, i) => {
              const cfg = STATUS_CFG[scan.status] ?? STATUS_CFG.pending;
              const Icon = cfg.icon;
              const total =
                (scan.findings?.critical ?? 0) +
                (scan.findings?.high ?? 0) +
                (scan.findings?.medium ?? 0) +
                (scan.findings?.low ?? 0);
              return (
                <motion.div
                  key={scan._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${cfg.color}18`,
                      border: `1px solid ${cfg.color}44`,
                    }}
                  >
                    {scan.status === "running" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: cfg.color }}
                        />
                      </motion.div>
                    ) : (
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {scan.name}
                    </div>
                    <div
                      className="text-xs mt-0.5 truncate font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {scan.targetUrl}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {scan.attackTypes?.length ?? 0} attack type(s)
                      </span>
                    </div>
                  </div>

                  {/* Severity counts */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {total > 0 ? (
                      <>
                        {scan.findings?.critical > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded severity-critical">
                            {scan.findings.critical}C
                          </span>
                        )}
                        {scan.findings?.high > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded severity-high">
                            {scan.findings.high}H
                          </span>
                        )}
                        {scan.findings?.medium > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded severity-medium">
                            {scan.findings.medium}M
                          </span>
                        )}
                      </>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No findings
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  {scan.status === "running" && (
                    <div className="hidden md:block w-24 flex-shrink-0">
                      <div
                        className="text-xs text-right mb-1"
                        style={{ color: "var(--cyan)" }}
                      >
                        {scan.progress}%
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${scan.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/scan/${scan._id}`}>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        style={{
                          color: "var(--text-primary)",
                          background: "var(--cyan-dim)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </button>
                    </Link>
                    {scan.status !== "running" && (
                      <button
                        onClick={() => deleteScan(scan._id, scan.name)}
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        style={{
                          color: "var(--danger)",
                          background: "var(--danger-dim)",
                          border: "1px solid rgba(255,75,75,0.25)",
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </PageWrapper>
    </>
  );
}
