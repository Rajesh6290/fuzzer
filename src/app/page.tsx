"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  Shield,
  Target,
  BarChart3,
  Terminal,
  Lock,
  Activity,
  Bug,
  Eye,
  Code2,
  Server,
  Globe,
  Play,
  ScanSearch,
  Cpu,
  Network,
  Radio,
  ChevronRight,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";

const TERMINAL_LINES = [
  {
    delay: 0.4,
    color: "#334155",
    text: "$ fuzzx scan --target https://target.com --all --depth 3",
  },
  {
    delay: 1.0,
    color: "#4f4fa8",
    text: "[*] FuzzX v2.4.1 — Security Fuzzer initialized",
  },
  {
    delay: 1.5,
    color: "#4f4fa8",
    text: "[*] Resolving host: target.com → 192.168.1.105",
  },
  {
    delay: 2.0,
    color: "#5c62b5",
    text: "[*] Fingerprinting server... Apache/2.4.51 (Linux)",
  },
  {
    delay: 2.5,
    color: "#334155",
    text: "[*] Crawling endpoints — found 14 routes",
  },
  {
    delay: 2.9,
    color: "#b45309",
    text: "[!] Found 7 injectable parameters across 4 routes",
  },
  {
    delay: 3.3,
    color: "#334155",
    text: "[*] Loading 200+ payloads for SQLi, XSS, LFI, CMDi...",
  },
  {
    delay: 3.7,
    color: "#334155",
    text: "[*] Starting SQL Injection attack surface scan...",
  },
  {
    delay: 4.1,
    color: "#b91c1c",
    text: "[!] CRITICAL  SQLi @ GET /api/user?id=1  [error-based]",
  },
  {
    delay: 4.5,
    color: "#b91c1c",
    text: "    ↳ payload: ' OR 1=1 UNION SELECT null,table_name--",
  },
  {
    delay: 4.8,
    color: "#b91c1c",
    text: "    ↳ response leaked: users, sessions, credentials",
  },
  {
    delay: 5.2,
    color: "#c2410c",
    text: "[!] HIGH     XSS  @ POST /search?q=  [reflected]",
  },
  {
    delay: 5.6,
    color: "#c2410c",
    text: "    ↳ payload: <img src=x onerror=alert(1)>",
  },
  {
    delay: 6.0,
    color: "#b91c1c",
    text: "[!] CRITICAL  LFI  @ GET /file?path=  [traversal]",
  },
  {
    delay: 6.4,
    color: "#b91c1c",
    text: "    ↳ payload: ../../../../etc/passwd",
  },
  {
    delay: 6.8,
    color: "#b45309",
    text: "[!] MEDIUM   SSRF @ POST /webhook  [internal]",
  },
  {
    delay: 7.3,
    color: "#15803d",
    text: "[✓] Scan complete — 9 vulns | Critical:3 High:2 Med:4",
  },
  {
    delay: 7.7,
    color: "#4f4fa8",
    text: "[*] Report → /reports/target_com_2026_03.json",
  },
];

const FEATURES = [
  {
    icon: Bug,
    title: "SQL Injection",
    color: "#dc2626",
    desc: "Detects error-based, time-based, and Union-based SQL injection across all input vectors.",
  },
  {
    icon: Code2,
    title: "Cross-Site Scripting",
    color: "#c2410c",
    desc: "Identifies reflected XSS vulnerabilities by analyzing payload reflection in HTTP responses.",
  },
  {
    icon: Globe,
    title: "Path Traversal",
    color: "#d97706",
    desc: "Tests for directory traversal flaws to detect unauthorized file system access.",
  },
  {
    icon: Terminal,
    title: "Command Injection",
    color: "#6160b0",
    desc: "Injects OS commands to detect server-side command execution vulnerabilities.",
  },
  {
    icon: Server,
    title: "SSRF Detection",
    color: "#6767c4",
    desc: "Probes internal endpoints and cloud metadata services to detect SSRF vulnerabilities.",
  },
  {
    icon: Lock,
    title: "XXE & LDAP",
    color: "#8188d3",
    desc: "Tests XML External Entity injection and LDAP injection in enterprise applications.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Configure Target",
    desc: "Enter your target URL, HTTP method, headers, and request body. Define the attack surface.",
  },
  {
    num: "02",
    title: "Select Attack Types",
    desc: "Choose from 8 attack categories including SQLi, XSS, Path Traversal, SSRF, and more.",
  },
  {
    num: "03",
    title: "Fuzz and Analyze",
    desc: "FuzzX injects intelligent payloads, monitors responses, and identifies vulnerabilities in real-time.",
  },
  {
    num: "04",
    title: "Review Report",
    desc: "Get detailed findings with severity ratings, evidence, and actionable remediation advice.",
  },
];

function TerminalDemo() {
  const [shownLines, setShownLines] = useState<number[]>([]);
  const [cycleKey, setCycleKey] = useState(0);
  const [tick, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [shownLines]);

  useEffect(() => {
    let lineIdx = 0;
    let stopped = false;
    let timerId: ReturnType<typeof setTimeout>;

    const showNext = () => {
      if (stopped) return;
      if (lineIdx < TERMINAL_LINES.length) {
        const idx = lineIdx;
        setShownLines((prev) => [...prev, idx]);
        lineIdx++;
        timerId = setTimeout(showNext, 600);
      } else {
        // pause, then wipe and restart
        timerId = setTimeout(() => {
          if (stopped) return;
          lineIdx = 0;
          setShownLines([]);
          setCycleKey((k) => k + 1);
          timerId = setTimeout(showNext, 500);
        }, 2500);
      }
    };

    timerId = setTimeout(showNext, 800);
    const clockTick = setInterval(() => setTick((t) => t + 1), 1000);

    return () => {
      stopped = true;
      clearTimeout(timerId);
      clearInterval(clockTick);
    };
  }, []); // runs once — self-cycling via closures

  const progress = Math.min(
    100,
    Math.round((shownLines.length / TERMINAL_LINES.length) * 100),
  );
  const runtime = (tick * 0.9).toFixed(1);
  const vulnCount = shownLines.filter((i) => i >= 8 && i <= 15).length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid var(--border)",
        boxShadow:
          "0 8px 32px rgba(97,96,176,0.10), 0 2px 8px rgba(97,96,176,0.06)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div
          className="flex items-center gap-2 text-xs font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          <Radio className="w-3 h-3" style={{ color: "var(--green)" }} />
          fuzzx — bash
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>
          ⏱ {runtime}s
        </span>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center gap-3 px-4 py-1.5 text-xs font-mono"
        style={{
          background: "var(--primary-50)",
          borderBottom: "1px solid var(--primary-100)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>target.com</span>
        <span style={{ color: "var(--border)" }}>│</span>
        <span
          style={{
            color: progress === 100 ? "var(--green)" : "var(--primary)",
          }}
        >
          {progress === 100 ? "✓ complete" : `scanning ${progress}%`}
        </span>
        <span style={{ color: "var(--border)" }}>│</span>
        <span
          style={{ color: vulnCount > 0 ? "#dc2626" : "var(--text-muted)" }}
        >
          {vulnCount} vuln{vulnCount !== 1 ? "s" : ""}
        </span>
        <div
          className="ml-auto flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          <Cpu className="w-3 h-3" />
          <span>{8 + (tick % 4)}%</span>
        </div>
      </div>

      {/* Terminal output — top to bottom, auto-scrolls to latest line */}
      <div
        ref={scrollRef}
        style={{
          height: 260,
          background: "#fafbfe",
          fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
        }}
      >
        <div className="p-4 flex flex-col gap-0.5">
          <AnimatePresence initial={false}>
            {shownLines.map((lineIdx) => {
              const line = TERMINAL_LINES[lineIdx];
              if (!line) return null;
              return (
                <motion.div
                  key={`${cycleKey}-${lineIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-xs leading-5 break-all"
                  style={{ color: line.color }}
                >
                  {line.text}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {progress < 100 && (
            <div
              className="cursor-blink text-xs"
              style={{ color: "var(--primary)" }}
            >
              &nbsp;
            </div>
          )}
        </div>
      </div>

      {/* Progress footer */}
      <div
        className="px-4 py-2.5"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between text-xs font-mono mb-1.5"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>scan progress</span>
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "var(--primary-100)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{
              height: "100%",
              background: progress === 100 ? "var(--green)" : "var(--primary)",
              borderRadius: 99,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const featuresRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresInView = useInView(featuresRef, {
    once: true,
    margin: "-80px",
  });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  return (
    <div
      className="min-h-dvh flex flex-col overflow-x-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <PublicNav activePage="home" />

      <section className="relative flex-1 flex items-start lg:items-center overflow-x-hidden px-4 sm:px-8 pt-10 pb-16 lg:py-0 lg:pb-10 min-h-dvh">
        <div className="cyber-grid absolute inset-0 opacity-40" />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ background: "var(--primary-400)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: "var(--primary-800)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: "var(--primary-50)",
                border: "1px solid var(--primary-200)",
                color: "var(--primary)",
              }}
            >
              <Activity className="w-3 h-3" /> Web Application Security Platform
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl xl:text-6xl font-black leading-tight mb-6"
            >
              Uncover{" "}
              <span className="text-gradient-cyan">Vulnerabilities</span>
              <br />
              Before They
              <br />
              Uncover <span className="text-gradient-green">You.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg leading-relaxed mb-8 max-w-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              FuzzX is a professional-grade web application fuzzer that
              automatically detects SQL injection, XSS, path traversal, command
              injection, SSRF, and more with real-time results and detailed
              reports.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/dashboard">
                <button className="btn-primary text-base">
                  <Play className="w-4 h-4" />
                  Start Scanning
                </button>
              </Link>
              <Link href="/scan/new">
                <button className="btn-outline text-base">
                  New Scan <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 mt-10"
            >
              {[
                { icon: Eye, label: "8 Attack Categories" },
                { icon: Target, label: "200+ Payloads" },
                { icon: BarChart3, label: "Severity Ratings" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />{" "}
                  {label}
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col gap-3 w-full"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            {/* live badge */}
            <div className="flex items-center justify-end">
              <span
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(22,163,74,0.10)",
                  color: "#16a34a",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse inline-block" />
                LIVE SIMULATION
              </span>
            </div>
            <TerminalDemo />
            {/* mini stats strip */}
            <div
              className="grid grid-cols-3 gap-2 text-center rounded-xl p-3"
              style={{
                background: "#ffffff",
                border: "1px solid var(--border)",
                boxShadow: "0 1px 4px rgba(97,96,176,0.07)",
              }}
            >
              {[
                { icon: Network, label: "Routes", val: "14" },
                { icon: Bug, label: "Vulns found", val: "9" },
                { icon: Activity, label: "Requests", val: "2.4k" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Icon
                      className="w-3 h-3"
                      style={{ color: "var(--primary)" }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {val}
                    </span>
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="features"
        className="py-10 sm:py-16 px-4 sm:px-8"
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-4xl font-black mb-4">
              Comprehensive{" "}
              <span className="text-gradient-cyan">Attack Coverage</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              FuzzX covers the OWASP Top 10 and beyond, with intelligent payload
              generation and response analysis.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: f.color + "22",
                    border: "1px solid " + f.color + "44",
                  }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="py-12 sm:py-20 px-4 sm:px-8"
        ref={stepsRef}
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-4xl font-black mb-4">
              How <span className="text-gradient-green">FuzzX Works</span>
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              From target configuration to vulnerability report in 4 simple
              steps.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6"
              >
                <div
                  className="text-4xl font-black mb-4"
                  style={{
                    color: "var(--cyan-dim)",
                    WebkitTextStroke: "1px var(--cyan)",
                  }}
                >
                  {step.num}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-12 sm:py-20 px-4 sm:px-8"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-14 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
              }}
            />
            <Shield
              className="w-14 h-14 mx-auto mb-6"
              style={{ color: "var(--primary)" }}
            />
            <h2 className="text-2xl sm:text-4xl font-black mb-4">
              Ready to{" "}
              <span className="text-gradient-cyan">Secure Your App?</span>
            </h2>
            <p
              className="text-lg mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Start fuzzing in seconds. Just enter your target URL and let FuzzX
              do the rest.
            </p>
            <Link href="/scan/new">
              <button className="btn-primary text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-10">
                <ScanSearch className="w-5 h-5" />
                Launch Your First Scan
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer
        className="py-8 px-4 sm:px-8 text-center text-sm"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <span className="font-bold" style={{ color: "var(--primary)" }}>
            FuzzX
          </span>
        </div>
        <p>
          Built as a B.Tech CSE Final Year Major Project. For authorized
          security testing only.
        </p>
        <p className="mt-1 text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
          Use only on systems you own or have explicit permission to test.
        </p>
      </footer>
    </div>
  );
}
