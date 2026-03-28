"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FileBarChart2,
  Download,
  ExternalLink,
  Shield,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import SeverityBadge from "@/components/SeverityBadge";
import type { ScanDoc, VulnerabilityDoc } from "@/types";

interface ReportScan extends ScanDoc {
  vulnerabilities?: VulnerabilityDoc[];
}

export default function ReportsPage() {
  const [scans, setScans] = useState<ReportScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scans?limit=50")
      .then((r) => r.json())
      .then(async (d) => {
        const completed: ReportScan[] = (d.scans ?? []).filter(
          (s: ScanDoc) => s.status === "completed" || s.status === "stopped",
        );
        setScans(completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadReport = async (scan: ReportScan) => {
    try {
      const res = await fetch(`/api/scans/${scan._id}`);
      const data = await res.json();
      const report = {
        reportType: "FuzzX Security Report",
        generatedAt: new Date().toISOString(),
        scan: data.scan,
        summary: {
          totalVulnerabilities: data.vulnerabilities?.length ?? 0,
          critical: data.scan.findings?.critical ?? 0,
          high: data.scan.findings?.high ?? 0,
          medium: data.scan.findings?.medium ?? 0,
          low: data.scan.findings?.low ?? 0,
        },
        vulnerabilities: data.vulnerabilities ?? [],
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `fuzzx-report-${scan.name.replace(/\s+/g, "-")}-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Swal.fire({
        title: "Report Downloaded!",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1e293b",
        iconColor: "#16a34a",
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to download report",
        icon: "error",
        background: "#ffffff",
        color: "#1e293b",
      });
    }
  };

  const totalVulns = scans.reduce(
    (acc, s) =>
      acc +
      (s.findings?.critical ?? 0) +
      (s.findings?.high ?? 0) +
      (s.findings?.medium ?? 0) +
      (s.findings?.low ?? 0),
    0,
  );
  const criticalCount = scans.reduce(
    (acc, s) => acc + (s.findings?.critical ?? 0),
    0,
  );
  const highCount = scans.reduce((acc, s) => acc + (s.findings?.high ?? 0), 0);

  return (
    <>
      <Navbar
        title="Reports"
        subtitle="Security assessment reports for completed scans"
      />
      <PageWrapper>
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Reports",
              value: scans.length,
              color: "#00d4ff",
              icon: FileBarChart2,
            },
            {
              label: "Total Vulnerabilities",
              value: totalVulns,
              color: "#ff8c00",
              icon: Bug,
            },
            {
              label: "Critical Findings",
              value: criticalCount,
              color: "#ff4b4b",
              icon: AlertTriangle,
            },
            {
              label: "High Findings",
              value: highCount,
              color: "#ff8c00",
              icon: TrendingUp,
            },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}44`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="text-xl font-black" style={{ color }}>
                  {value}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
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
        ) : scans.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileBarChart2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p style={{ color: "var(--text-secondary)" }}>
              No completed scans yet. Complete a scan to generate reports.
            </p>
            <Link href="/scan/new">
              <button className="btn-outline mt-4 text-sm">Start a Scan</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan, i) => {
              const totalF =
                (scan.findings?.critical ?? 0) +
                (scan.findings?.high ?? 0) +
                (scan.findings?.medium ?? 0) +
                (scan.findings?.low ?? 0);
              const riskLevel =
                (scan.findings?.critical ?? 0) > 0
                  ? "CRITICAL"
                  : (scan.findings?.high ?? 0) > 0
                    ? "HIGH"
                    : (scan.findings?.medium ?? 0) > 0
                      ? "MEDIUM"
                      : totalF > 0
                        ? "LOW"
                        : "SAFE";
              const riskColor =
                riskLevel === "CRITICAL"
                  ? "#ff4b4b"
                  : riskLevel === "HIGH"
                    ? "#ff8c00"
                    : riskLevel === "MEDIUM"
                      ? "#f59e0b"
                      : riskLevel === "LOW"
                        ? "#00d4ff"
                        : "#00ff9f";

              return (
                <motion.div
                  key={scan._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Risk badge */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${riskColor}18`,
                        border: `1px solid ${riskColor}44`,
                      }}
                    >
                      {riskLevel === "SAFE" ? (
                        <CheckCircle2
                          className="w-6 h-6"
                          style={{ color: riskColor }}
                        />
                      ) : (
                        <Shield
                          className="w-6 h-6"
                          style={{ color: riskColor }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-base">{scan.name}</h3>
                        <span
                          className="text-xs font-black px-2 py-0.5 rounded"
                          style={{
                            color: riskColor,
                            background: `${riskColor}18`,
                            border: `1px solid ${riskColor}44`,
                          }}
                        >
                          {riskLevel}
                        </span>
                      </div>
                      <div
                        className="text-xs font-mono mb-2 truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {scan.targetUrl}
                      </div>
                      <div
                        className="flex flex-wrap gap-3 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {scan.attackTypes?.length ?? 0} attack types
                        </span>
                        <span
                          style={{ color: totalF > 0 ? "#ff8c00" : "#00ff9f" }}
                        >
                          {totalF} finding(s)
                        </span>
                      </div>

                      {/* Severity pills */}
                      {totalF > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(["critical", "high", "medium", "low"] as const).map(
                            (sev) =>
                              (scan.findings?.[sev] ?? 0) > 0 ? (
                                <span
                                  key={sev}
                                  className="text-xs px-2 py-0.5 rounded font-semibold capitalize"
                                  style={{ background: `${riskColor}12` }}
                                >
                                  <SeverityBadge severity={sev} size="sm" />{" "}
                                  &times;{scan.findings[sev]}
                                </span>
                              ) : null,
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/scan/${scan._id}`}>
                        <button className="btn-outline text-sm py-2 px-4">
                          <ExternalLink className="w-4 h-4" /> Details
                        </button>
                      </Link>
                      <button
                        className="btn-primary text-sm py-2 px-4"
                        onClick={() => downloadReport(scan)}
                      >
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>
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
