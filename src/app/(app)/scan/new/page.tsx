"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Bug,
  Code2,
  Globe,
  Terminal,
  Server,
  Lock,
  FileCode2,
  Network,
  Check,
  Play,
  AlertCircle,
  Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";
import type { AttackType, HttpMethod } from "@/types";

const ATTACK_TYPES = [
  {
    id: "sqli" as AttackType,
    label: "SQL Injection",
    desc: "Tests for database injection flaws",
    icon: Bug,
    color: "#ff4b4b",
  },
  {
    id: "xss" as AttackType,
    label: "Cross-Site Scripting",
    desc: "Detects reflected XSS vulnerabilities",
    icon: Code2,
    color: "#ff8c00",
  },
  {
    id: "path_traversal" as AttackType,
    label: "Path Traversal",
    desc: "File system access test",
    icon: Globe,
    color: "#f59e0b",
  },
  {
    id: "cmd_injection" as AttackType,
    label: "Command Injection",
    desc: "OS command execution detection",
    icon: Terminal,
    color: "#16a34a",
  },
  {
    id: "ssrf" as AttackType,
    label: "SSRF",
    desc: "Server-side request forgery",
    icon: Server,
    color: "#6160b0",
  },
  {
    id: "open_redirect" as AttackType,
    label: "Open Redirect",
    desc: "URL redirect vulnerability",
    icon: Globe,
    color: "#8188d3",
  },
  {
    id: "xxe" as AttackType,
    label: "XXE Injection",
    desc: "XML external entity injection",
    icon: FileCode2,
    color: "#e879f9",
  },
  {
    id: "ldap" as AttackType,
    label: "LDAP Injection",
    desc: "Directory service injection",
    icon: Network,
    color: "#38bdf8",
  },
];

const STEPS = ["Target Config", "Attack Types", "Options", "Review & Start"];

interface ScanForm {
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: { key: string; value: string }[];
  requestBody: string;
  attackTypes: AttackType[];
  timeout: number;
  delay: number;
  maxPayloads: number;
  followRedirects: boolean;
  cookies: string;
}

const DEFAULT_FORM: ScanForm = {
  name: "",
  targetUrl: "",
  method: "GET",
  headers: [],
  requestBody: "",
  attackTypes: ["sqli", "xss"],
  timeout: 5,
  delay: 0,
  maxPayloads: 15,
  followRedirects: false,
  cookies: "",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background:
                  i < current
                    ? "var(--primary)"
                    : i === current
                      ? "var(--cyan-dim)"
                      : "var(--bg-secondary)",
                border:
                  i === current
                    ? "1px solid var(--primary)"
                    : i < current
                      ? "none"
                      : "1px solid var(--border)",
                color: i <= current ? "#ffffff" : "var(--text-muted)",
              }}
            >
              {i < current ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className="hidden sm:block text-xs font-medium"
              style={{
                color: i === current ? "var(--primary)" : "var(--text-muted)",
              }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="w-8 lg:w-16 h-px mx-1"
              style={{
                background: i < current ? "var(--primary)" : "var(--border)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Target ── */
function StepTarget({
  form,
  setForm,
}: {
  form: ScanForm;
  setForm: (f: ScanForm) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Scan Name *
        </label>
        <input
          className="cyber-input"
          placeholder="e.g. Production API Security Test"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Target URL *
        </label>
        <input
          className="cyber-input font-mono"
          placeholder="https://target.example.com/api/endpoint?id=1"
          value={form.targetUrl}
          onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
        />
        <p
          className="text-xs mt-1.5 flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <Info className="w-3 h-3" /> Include query parameters to define
          injection points
        </p>
      </div>
      <div>
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          HTTP Method
        </label>
        <select
          className="cyber-input cyber-select"
          value={form.method}
          onChange={(e) =>
            setForm({ ...form, method: e.target.value as HttpMethod })
          }
        >
          {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-sm font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Custom Headers
          </label>
          <button
            className="btn-outline text-xs py-1.5 px-3"
            onClick={() =>
              setForm({
                ...form,
                headers: [...form.headers, { key: "", value: "" }],
              })
            }
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {form.headers.length === 0 && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            No custom headers. Common headers like Accept and Content-Type are
            added automatically.
          </p>
        )}
        {form.headers.map((h, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="cyber-input text-xs"
              placeholder="Header name"
              value={h.key}
              onChange={(e) => {
                const hs = [...form.headers];
                hs[i].key = e.target.value;
                setForm({ ...form, headers: hs });
              }}
            />
            <input
              className="cyber-input text-xs"
              placeholder="Value"
              value={h.value}
              onChange={(e) => {
                const hs = [...form.headers];
                hs[i].value = e.target.value;
                setForm({ ...form, headers: hs });
              }}
            />
            <button
              className="btn-danger py-1 px-3 text-xs shrink-0"
              onClick={() =>
                setForm({
                  ...form,
                  headers: form.headers.filter((_, j) => j !== i),
                })
              }
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Request Body */}
      {form.method !== "GET" && (
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Request Body (JSON or form-encoded)
          </label>
          <textarea
            className="cyber-input font-mono text-xs resize-y"
            rows={4}
            placeholder={'{"username": "test", "password": "test"}'}
            value={form.requestBody}
            onChange={(e) => setForm({ ...form, requestBody: e.target.value })}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            JSON object keys will be used as injection points
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Attack Types ── */
function StepAttackTypes({
  form,
  setForm,
}: {
  form: ScanForm;
  setForm: (f: ScanForm) => void;
}) {
  const toggle = (id: AttackType) => {
    if (form.attackTypes.includes(id)) {
      setForm({
        ...form,
        attackTypes: form.attackTypes.filter((a) => a !== id),
      });
    } else {
      setForm({ ...form, attackTypes: [...form.attackTypes, id] });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Select the vulnerability types to test ({form.attackTypes.length}{" "}
          selected)
        </p>
        <div className="flex gap-2">
          <button
            className="text-xs py-1 px-3 rounded transition-all"
            style={{ color: "var(--cyan)", border: "1px solid var(--border)" }}
            onClick={() =>
              setForm({ ...form, attackTypes: ATTACK_TYPES.map((a) => a.id) })
            }
          >
            All
          </button>
          <button
            className="text-xs py-1 px-3 rounded transition-all"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => setForm({ ...form, attackTypes: [] })}
          >
            None
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {ATTACK_TYPES.map((at) => {
          const selected = form.attackTypes.includes(at.id);
          return (
            <motion.button
              key={at.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggle(at.id)}
              className="text-left p-4 rounded-xl transition-all"
              style={{
                background: selected ? `${at.color}14` : "var(--bg-secondary)",
                border: `1px solid ${selected ? at.color + "66" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${at.color}22`,
                      border: `1px solid ${at.color}44`,
                    }}
                  >
                    <at.icon className="w-4 h-4" style={{ color: at.color }} />
                  </div>
                  <span className="font-semibold text-sm">{at.label}</span>
                </div>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: selected ? at.color : "transparent",
                    border: `1px solid ${selected ? at.color : "var(--border)"}`,
                  }}
                >
                  {selected && <Check className="w-3 h-3 text-black" />}
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {at.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 3: Options ── */
function StepOptions({
  form,
  setForm,
}: {
  form: ScanForm;
  setForm: (f: ScanForm) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Request Timeout:{" "}
            <span style={{ color: "var(--cyan)" }}>{form.timeout}s</span>
          </label>
          <input
            type="range"
            min={1}
            max={15}
            value={form.timeout}
            onChange={(e) => setForm({ ...form, timeout: +e.target.value })}
            className="w-full accent-[#6160b0]"
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span>1s</span>
            <span>15s</span>
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Request Delay:{" "}
            <span style={{ color: "var(--cyan)" }}>{form.delay}ms</span>
          </label>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            value={form.delay}
            onChange={(e) => setForm({ ...form, delay: +e.target.value })}
            className="w-full accent-[#6160b0]"
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span>0ms</span>
            <span>2s</span>
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Max Payloads/Type:{" "}
            <span style={{ color: "var(--cyan)" }}>{form.maxPayloads}</span>
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={form.maxPayloads}
            onChange={(e) => setForm({ ...form, maxPayloads: +e.target.value })}
            className="w-full accent-[#6160b0]"
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span>5</span>
            <span>50</span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() =>
            setForm({ ...form, followRedirects: !form.followRedirects })
          }
          className="w-11 h-6 rounded-full transition-all relative shrink-0"
          style={{
            background: form.followRedirects ? "var(--primary)" : "#cbd5e1",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          <span
            className="w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm"
            style={{
              left: form.followRedirects ? "calc(100% - 20px)" : "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
        <div>
          <div className="text-sm font-semibold">Follow Redirects</div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Follow HTTP 3xx redirects during scanning
          </div>
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Cookies (optional)
        </label>
        <input
          className="cyber-input font-mono text-xs"
          placeholder="sessionid=abc123; token=xyz"
          value={form.cookies}
          onChange={(e) => setForm({ ...form, cookies: e.target.value })}
        />
      </div>

      {/* Estimated info */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{
          background: "var(--primary-50)",
          border: "1px solid var(--border)",
        }}
      >
        <Info
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: "var(--cyan)" }}
        />
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>
            Estimated requests:
          </strong>{" "}
          ~{form.attackTypes.length} types × up to {form.maxPayloads} payloads ×
          injection points detected
          <br />
          The scan will auto-detect query parameters and body fields as
          injection points.
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Review ── */
function StepReview({ form }: { form: ScanForm }) {
  return (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-3">
        {[
          ["Scan Name", form.name],
          ["Target URL", form.targetUrl],
          ["HTTP Method", form.method],
          ["Timeout", `${form.timeout}s`],
          ["Delay", `${form.delay}ms`],
          ["Max Payloads", `${form.maxPayloads} per type`],
        ].map(([k, v]) => (
          <div key={k} className="flex items-start gap-4 text-sm">
            <span
              className="w-28 shrink-0 font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {k}
            </span>
            <span
              className="font-mono text-xs break-all"
              style={{ color: "var(--text-primary)" }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Attack Types ({form.attackTypes.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {form.attackTypes.map((id) => {
            const at = ATTACK_TYPES.find((a) => a.id === id);
            return at ? (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
                style={{
                  background: `${at.color}14`,
                  border: `1px solid ${at.color}44`,
                  color: at.color,
                }}
              >
                <at.icon className="w-3 h-3" />
                {at.label}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(255,75,75,0.07)",
          border: "1px solid rgba(255,75,75,0.25)",
        }}
      >
        <AlertCircle
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: "#ff4b4b" }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          <strong style={{ color: "#ff4b4b" }}>Authorized use only.</strong>{" "}
          Only scan systems you own or have explicit written permission to test.
          Unauthorized scanning may be illegal.
        </p>
      </div>
    </div>
  );
}

export default function NewScanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ScanForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.name.trim()) return "Scan name is required";
      if (!form.targetUrl.trim()) return "Target URL is required";
      try {
        new URL(form.targetUrl);
      } catch {
        return "Enter a valid URL (include https://)";
      }
    }
    if (step === 1 && form.attackTypes.length === 0)
      return "Select at least one attack type";
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      Swal.fire({
        title: "Validation Error",
        text: err,
        icon: "warning",
        background: "#080f1e",
        color: "#e2e8f0",
        confirmButtonColor: "#6160b0",
        iconColor: "#f59e0b",
      });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const err = validateStep();
    if (err) {
      Swal.fire({
        title: "Error",
        text: err,
        icon: "error",
        background: "#080f1e",
        color: "#e2e8f0",
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: "Start Scan?",
      html: `Scanning <strong>${form.targetUrl}</strong><br/>with ${form.attackTypes.length} attack type(s).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Start Scanning",
      cancelButtonText: "Cancel",
      background: "#080f1e",
      color: "#e2e8f0",
      confirmButtonColor: "#6160b0",
      cancelButtonColor: "#374151",
      iconColor: "#6160b0",
    });

    if (!confirmed.isConfirmed) return;

    setSubmitting(true);
    try {
      const headersObj: Record<string, string> = {};
      form.headers.forEach(({ key, value }) => {
        if (key) headersObj[key] = value;
      });

      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, headers: headersObj }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create scan");

      const scanId = data.scan._id;

      // Start the scan
      const startRes = await fetch(`/api/scans/${scanId}/start`, {
        method: "POST",
      });
      if (!startRes.ok) {
        const sd = await startRes.json();
        throw new Error(sd.error ?? "Failed to start scan");
      }

      Swal.fire({
        title: "Scan Started!",
        text: "Redirecting to live results...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#080f1e",
        color: "#e2e8f0",
        iconColor: "#16a34a",
      });
      setTimeout(() => router.push(`/scan/${scanId}`), 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      Swal.fire({
        title: "Error",
        text: msg,
        icon: "error",
        background: "#080f1e",
        color: "#e2e8f0",
        confirmButtonColor: "#ff4b4b",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepComponents = [
    <StepTarget key={0} form={form} setForm={setForm} />,
    <StepAttackTypes key={1} form={form} setForm={setForm} />,
    <StepOptions key={2} form={form} setForm={setForm} />,
    <StepReview key={3} form={form} />,
  ];

  return (
    <>
      <Navbar title="New Scan" subtitle="Configure a new security scan" />
      <PageWrapper>
        <div className="max-w-2xl mx-auto">
          <StepIndicator current={step} />
          <div className="glass-card p-7">
            <h2 className="text-lg font-bold mb-5">{STEPS[step]}</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                {stepComponents[step]}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div
              className="flex items-center justify-between mt-8 pt-5"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                onClick={prev}
                disabled={step === 0}
                className="btn-outline text-sm"
                style={{ opacity: step === 0 ? 0.3 : 1 }}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="btn-primary text-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="btn-primary text-sm"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "linear",
                        }}
                        className="w-4 h-4 rounded-full border-2 border-t-transparent border-black"
                      />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Launch Scan
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
