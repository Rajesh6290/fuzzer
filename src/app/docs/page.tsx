"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bug,
  Code2,
  Terminal,
  Server,
  Globe,
  FileCode2,
  Network,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Settings,
  BarChart2,
  Clock,
  Hash,
  Layers,
  CheckCircle2,
  StopCircle,
  Play,
  Download,
  RefreshCcw,
  Shuffle,
  Activity,
  DatabaseZap,
} from "lucide-react";
import PublicNav from "@/components/PublicNav";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "new-scan", label: "Creating a Scan" },
  { id: "attack-types", label: "Attack Types" },
  { id: "options", label: "Scan Options" },
  { id: "results", label: "Reading Results" },
  { id: "activity-log", label: "Activity Log" },
  { id: "detection", label: "How Detection Works" },
  { id: "stop-resume", label: "Stop & Resume" },
  { id: "reports", label: "Reports & Export" },
  { id: "targets", label: "Test Targets" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="scroll-mt-20"
    >
      <h2
        className="text-lg font-bold mb-4 pb-2"
        style={{
          borderBottom: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      <div
        className="space-y-4 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </motion.section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
        style={{ background: "var(--primary)" }}
      >
        {n}
      </div>
      <div>
        <div
          className="font-semibold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded text-xs font-mono"
      style={{
        background: "var(--bg-secondary)",
        color: "var(--cyan)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="p-3 rounded-lg text-xs font-mono overflow-x-auto max-w-full w-full block whitespace-pre-wrap wrap-break-word"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </pre>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{
        background: color + "18",
        color,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
    </span>
  );
}

function AttackCard({
  icon: Icon,
  color,
  name,
  desc,
  example,
}: {
  icon: React.ElementType;
  color: string;
  name: string;
  desc: string;
  example: string;
}) {
  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: color + "18", border: `1px solid ${color}33` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span
          className="font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </span>
      </div>
      <p className="text-xs">{desc}</p>
      <div
        className="text-xs font-mono px-2 py-1 rounded overflow-x-auto whitespace-pre-wrap break-all"
        style={{ background: "var(--bg-secondary)", color: "#c2410c" }}
      >
        {example}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Watch all section elements — whichever is most visible sets the active TOC item
    const sectionEls = SECTIONS.map((s) =>
      document.getElementById(s.id),
    ).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        // Trigger when a section enters the top 20% of the viewport
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
    );

    sectionEls.forEach((el) => observerRef.current!.observe(el));

    // When scrolled to the bottom, force-activate the last section
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 40
      ) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-dvh flex flex-col overflow-x-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Public nav */}
      <PublicNav activePage="docs" />

      <div className="flex-1 p-3 sm:p-6">
        {/* Mobile section jump nav */}
        <div className="lg:hidden mb-4 overflow-x-auto">
          <div className="flex gap-1.5 pb-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all shrink-0"
                style={{
                  background:
                    activeSection === s.id
                      ? "var(--primary)"
                      : "var(--bg-secondary)",
                  color:
                    activeSection === s.id ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-8 max-w-6xl mx-auto">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-20 space-y-1">
              <div
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                On this page
              </div>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                  style={{
                    background:
                      activeSection === s.id
                        ? "var(--primary-50)"
                        : "transparent",
                    color:
                      activeSection === s.id
                        ? "var(--primary)"
                        : "var(--text-secondary)",
                    fontWeight: activeSection === s.id ? 600 : 400,
                  }}
                >
                  {activeSection === s.id && (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-12">
            {/* Overview */}
            <Section id="overview" title="Overview">
              <p>
                <strong style={{ color: "var(--text-primary)" }}>FuzzX</strong>{" "}
                is a web application security fuzzer. It automatically discovers
                injection vulnerabilities by sending crafted payloads to your
                target URL and analyzing responses for signs of exploitation.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                {[
                  {
                    icon: Zap,
                    color: "#6160b0",
                    title: "Automated",
                    desc: "Sends hundreds of payloads automatically across all detected parameters",
                  },
                  {
                    icon: ShieldCheck,
                    color: "#16a34a",
                    title: "Multi-Attack",
                    desc: "Covers 11 attack types including SQLi, XSS, SSRF, SSTI, NoSQL, and more",
                  },
                  {
                    icon: BarChart2,
                    color: "#d97706",
                    title: "Confidence Scoring",
                    desc: "Every finding is rated low / medium / high confidence with full evidence",
                  },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="glass-card p-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{
                        background: color + "18",
                        border: `1px solid ${color}33`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {title}
                    </div>
                    <p className="text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Quick Start */}
            <Section id="quickstart" title="Quick Start">
              <p>Get your first scan running in under 2 minutes:</p>
              <div className="space-y-5 mt-4">
                <Step n={1} title="Go to New Scan">
                  Click <strong>New Scan</strong> in the sidebar or the{" "}
                  <Code>+ New Scan</Code> button in the top right.
                </Step>
                <Step n={2} title="Enter target URL">
                  Paste a URL that contains query parameters. Example:
                  <br />
                  <CodeBlock>
                    https://juice-shop.herokuapp.com/rest/products/search?q=test
                  </CodeBlock>
                  The <Code>q</Code> parameter will be automatically detected as
                  an injection point.
                </Step>
                <Step n={3} title="Select attack types">
                  Choose <strong>SQLi</strong> and <strong>XSS</strong> for a
                  quick first test. More attack types = more requests = longer
                  scan.
                </Step>
                <Step n={4} title="Start the scan">
                  Click <strong>Start Scan</strong> on the Review step. You will
                  be redirected to the live results page immediately.
                </Step>
                <Step n={5} title="Watch the Activity Log">
                  Switch to the <strong>Activity Log</strong> tab to see each
                  request in real time. When the scan completes, a popup will
                  show the total vulnerabilities found.
                </Step>
              </div>
            </Section>

            {/* Creating a Scan */}
            <Section id="new-scan" title="Creating a Scan — All Fields">
              <div className="space-y-3">
                {[
                  {
                    field: "Scan Name",
                    req: true,
                    desc: "A label for this scan. Used in the dashboard and reports. Example: Production API Test",
                  },
                  {
                    field: "Target URL",
                    req: true,
                    desc: "The full URL including query parameters. Parameters in the URL are auto-detected as injection points. Example: https://example.com/api?id=1&search=test",
                  },
                  {
                    field: "Method",
                    req: true,
                    desc: "HTTP method: GET, POST, PUT, PATCH, DELETE. For POST/PUT, add a request body too.",
                  },
                  {
                    field: "Headers",
                    req: false,
                    desc: "Custom request headers as key-value pairs. Useful for Authorization tokens or custom API headers.",
                  },
                  {
                    field: "Request Body",
                    req: false,
                    desc: "JSON or form-encoded body for POST/PUT requests. Parameters in the body are auto-detected as injection points.",
                  },
                  {
                    field: "Cookies",
                    req: false,
                    desc: "Cookie string sent with every request. Example: session=abc123; token=xyz",
                  },
                  {
                    field: "Timeout (sec)",
                    req: false,
                    desc: "Max seconds to wait for each response. Default: 5. Increase to 10-15 for slow targets.",
                  },
                  {
                    field: "Delay (ms)",
                    req: false,
                    desc: "Wait time between requests in milliseconds. Default: 0. Use 500–1000 to avoid rate limiting.",
                  },
                  {
                    field: "Max Payloads",
                    req: false,
                    desc: "Maximum payloads per attack type. Default: 15. Lower = faster scan, higher = more coverage.",
                  },
                  {
                    field: "Follow Redirects",
                    req: false,
                    desc: "Whether to follow HTTP 3xx redirects. Default: off. Enable for apps that redirect after auth.",
                  },
                ].map(({ field, req, desc }) => (
                  <div
                    key={field}
                    className="flex gap-2 sm:gap-3 p-3 rounded-lg"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="shrink-0 w-24 sm:w-36">
                      <span
                        className="font-semibold text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {field}
                      </span>
                      {req && (
                        <span className="ml-1 text-[10px] text-red-500">
                          *required
                        </span>
                      )}
                    </div>
                    <p className="text-xs">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Attack Types */}
            <Section id="attack-types" title="Attack Types">
              <p>
                FuzzX supports 11 attack types. Each injects different payloads
                into detected parameters and analyzes the response.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <AttackCard
                  icon={Bug}
                  color="#ff4b4b"
                  name="SQL Injection (SQLi)"
                  desc="Detects error-based (20+ DB error patterns), boolean-based blind (body-diff vs baseline), time-based blind (adaptive sleep threshold), and HTTP 500 responses on SQL payloads."
                  example="' OR 1=1-- / ' AND SLEEP(5)-- / ' AND EXTRACTVALUE(1,CONCAT(0x7e,version()))--"
                />
                <AttackCard
                  icon={Code2}
                  color="#ff8c00"
                  name="Cross-Site Scripting (XSS)"
                  desc="Detects reflected XSS by injecting script tags and checking if the payload appears unescaped in the response. Identifies script, attribute, and unknown contexts."
                  example="<script>alert(1)</script>"
                />
                <AttackCard
                  icon={Globe}
                  color="#f59e0b"
                  name="Path Traversal"
                  desc="Tests if the server exposes files outside the web root by injecting directory traversal sequences into parameters."
                  example="../../../etc/passwd"
                />
                <AttackCard
                  icon={Terminal}
                  color="#16a34a"
                  name="Command Injection"
                  desc="Two detection modes: output-based (checks response for uid=, ls output, Linux version, system user patterns) and time-based blind (adaptive sleep/ping threshold). Output-based has high confidence; time-based fires when no output is visible."
                  example="; whoami / | id / $(id) / ; sleep 5"
                />
                <AttackCard
                  icon={Server}
                  color="#6160b0"
                  name="SSRF"
                  desc="Tests Server-Side Request Forgery by injecting internal/localhost URLs and cloud metadata endpoints into URL-like parameters."
                  example="http://127.0.0.1/admin"
                />
                <AttackCard
                  icon={Globe}
                  color="#8188d3"
                  name="Open Redirect"
                  desc="Checks the Location response header on 3xx redirects. Flags external-domain redirects (medium), and javascript:/data: URI redirects (high) which can execute arbitrary scripts in some browsers."
                  example="https://evil.com / javascript:alert(1) / //evil.com"
                />
                <AttackCard
                  icon={FileCode2}
                  color="#e879f9"
                  name="XXE Injection"
                  desc="Injects XML External Entity payloads into XML body parameters to detect file read and SSRF via XML parsers."
                  example='<!DOCTYPE x [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'
                />
                <AttackCard
                  icon={Network}
                  color="#38bdf8"
                  name="LDAP Injection"
                  desc="Two detection modes: data-based (response contains LDAP directory entries like uid=, cn=, dc= — high confidence) and error-based (LDAP error strings like javax.naming.ldap, ActiveDirectory in response — medium confidence)."
                  example="*)(uid=*))(|(uid=* / admin)(&)"
                />
                <AttackCard
                  icon={Layers}
                  color="#a78bfa"
                  name="SSTI"
                  desc="Injects math probes ({{7*7}}, ${7*7}, <%= 7*7 %>, #{7*7}, *{7*7}, @(7*7)) and verifies if the result 49 or 7777777 appears in the response — confirming server-side evaluation. Also detects config/secret-key leaks via {{config}}."
                  example={
                    '{{7*7}} → 49 in response / {{config}} / ${"freemarker.template.utility.Execute"?new()("id")}'
                  }
                />
                <AttackCard
                  icon={Hash}
                  color="#34d399"
                  name="NoSQL Injection"
                  desc="Two detection modes: auth-bypass (response returns token/JWT/success on $ne/$gt/$regex operators — critical) and error-based (MongoError, Mongoose, BSON, ObjectId errors in response — high). Supports both JSON body operators and URL param variants."
                  example='{"$ne": null} / {"$gt": ""} / [$regex]=.*'
                />
                <AttackCard
                  icon={Settings}
                  color="#fb923c"
                  name="GraphQL"
                  desc="Two detection modes: introspection (response contains __schema + types keys — confirms full schema exposure) and injection/error-based (structured GraphQL errors with locations/path keys after SQLi-style payloads in resolver arguments)."
                  example={
                    '{__schema{types{name}}} / {user(id:"1 OR 1=1"){id name}}'
                  }
                />
              </div>
            </Section>

            {/* Scan Options */}
            <Section id="options" title="Scan Options — Recommended Values">
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    icon: Clock,
                    color: "#6160b0",
                    title: "Timeout",
                    lines: [
                      "5s — fast local targets",
                      "10s — public APIs",
                      "15s — slow servers or time-based attacks",
                    ],
                  },
                  {
                    icon: Zap,
                    color: "#d97706",
                    title: "Max Payloads",
                    lines: [
                      "5 — quick sanity check",
                      "15 — balanced (default)",
                      "30+ — deep scan, takes longer",
                    ],
                  },
                  {
                    icon: Settings,
                    color: "#16a34a",
                    title: "Delay",
                    lines: [
                      "0ms — no rate limit concerns",
                      "500ms — avoid rate limiting",
                      "1000ms+ — very strict targets",
                    ],
                  },
                  {
                    icon: CheckCircle2,
                    color: "#e879f9",
                    title: "Attack Types",
                    lines: [
                      "SQLi + XSS — fastest common test",
                      "Add CMDi + SSRF for APIs",
                      "All 11 — comprehensive audit",
                    ],
                  },
                ].map(({ icon: Icon, color, title, lines }) => (
                  <div key={title} className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4" style={{ color }} />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {title}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {lines.map((l) => (
                        <li key={l} className="text-xs flex items-start gap-2">
                          <span
                            className="mt-1 w-1 h-1 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            {/* Reading Results */}
            <Section id="results" title="Reading Results">
              <p>
                Results are shown in the{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  Vulnerabilities
                </strong>{" "}
                tab. Each finding shows:
              </p>
              <div className="space-y-3 mt-3">
                <div
                  className="p-4 rounded-lg space-y-3"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge color="#dc2626" label="CRITICAL" />
                    <Badge color="#c2410c" label="HIGH" />
                    <Badge color="#d97706" label="MEDIUM" />
                    <Badge color="#6160b0" label="LOW" />
                    <span className="text-xs">
                      — severity of the vulnerability
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge color="#16a34a" label="high confidence" />
                    <Badge color="#ca8a04" label="medium confidence" />
                    <Badge color="#94a3b8" label="low confidence" />
                    <span className="text-xs">
                      — how certain the detection is
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "URL",
                      desc: "The exact URL that was tested with this payload.",
                    },
                    {
                      label: "Payload",
                      desc: "The string injected into the parameter that triggered the vulnerability.",
                    },
                    {
                      label: "Evidence",
                      desc: "What the analyzer found — e.g. SQL error text, reflected payload, response time spike.",
                    },
                    {
                      label: "Description",
                      desc: "Explains what type of vulnerability was detected and why it's dangerous.",
                    },
                    {
                      label: "Recommendation",
                      desc: "How to fix the vulnerability — parameterized queries, output encoding, etc.",
                    },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex gap-3 text-xs">
                      <Code>{label}</Code>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* Activity Log */}
            <Section id="activity-log" title="Activity Log">
              <p>
                The{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  Activity Log
                </strong>{" "}
                tab shows every request the engine makes in real time.
              </p>
              <div className="mt-3 space-y-3">
                <CodeBlock>{`20:34:12  OK   GET  /search?q=test  param=q  query  payload=' OR 1=1--  500  312ms  VULNERABLE
20:34:12  OK   GET  /search?q=test  param=q  query  payload=1 AND 1=1  200  87ms   ✓ clean`}</CodeBlock>
                <div className="space-y-2">
                  {[
                    {
                      tag: "OK",
                      color: "#16a34a",
                      desc: "Request completed successfully",
                    },
                    {
                      tag: "ERR",
                      color: "#dc2626",
                      desc: "Request failed — network error, timeout, or connection reset",
                    },
                    {
                      tag: "VULNERABLE",
                      color: "#dc2626",
                      desc: "Analyzer detected a vulnerability in this response",
                    },
                    {
                      tag: "clean",
                      color: "#94a3b8",
                      desc: "Response shows no signs of vulnerability",
                    },
                  ].map(({ tag, color, desc }) => (
                    <div key={tag} className="flex items-center gap-3 text-xs">
                      <Badge color={color} label={tag} />
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs">
                  The top bar shows <Code>ATTACKS</Code> and <Code>PARAMS</Code>{" "}
                  — the detected injection points and active attack types for
                  this scan.
                </p>
              </div>
            </Section>

            {/* How Detection Works */}
            <Section id="detection" title="How Detection Works">
              <p>
                Understanding the engine internals helps you interpret results
                accurately and tune scans for your target.
              </p>
              <div className="space-y-4 mt-4">
                {/* Baseline */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Activity
                      className="w-4 h-4"
                      style={{ color: "#6160b0" }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Baseline Request
                    </span>
                  </div>
                  <p className="text-xs">
                    Before sending any payloads, FuzzX fires one clean request
                    to the target and records the response time and body size.
                    This baseline is used as the reference for all time-based
                    and body-diff detections.
                  </p>
                </div>
                {/* Payload Mutations */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4" style={{ color: "#d97706" }} />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Payload Mutations
                    </span>
                  </div>
                  <p className="text-xs mb-2">
                    Each payload is automatically mutated into multiple variants
                    to bypass WAFs and input filters:
                  </p>
                  <ul className="space-y-1">
                    {[
                      ["URL-encoded", "%27 OR 1%3D1--"],
                      ["Double URL-encoded", "%2527 OR 1%253D1--"],
                      ["Case variation (SQL keywords)", "SeLeCt * FrOm users"],
                      [
                        "Comment obfuscation (spaces → /**/)",
                        "SELECT/**/1/**/FROM/**/users",
                      ],
                    ].map(([label, ex]) => (
                      <li
                        key={label}
                        className="text-xs flex items-start gap-2"
                      >
                        <span
                          className="mt-1 w-1 h-1 rounded-full shrink-0"
                          style={{ background: "#d97706" }}
                        />
                        <span>
                          <strong style={{ color: "var(--text-primary)" }}>
                            {label}:
                          </strong>{" "}
                          <code
                            className="font-mono"
                            style={{ color: "var(--cyan)" }}
                          >
                            {ex}
                          </code>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Injection Points */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <DatabaseZap
                      className="w-4 h-4"
                      style={{ color: "#16a34a" }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Automatic Injection Point Detection
                    </span>
                  </div>
                  <p className="text-xs mb-2">
                    The engine discovers injection points automatically — you
                    never need to specify them manually:
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Query parameters from the URL (e.g. ?id=1&search=test)",
                      "JSON body keys for POST/PUT requests",
                      "Form-encoded body params (application/x-www-form-urlencoded)",
                      "Headers: User-Agent and X-Forwarded-For are always tested",
                      "No params detected? Falls back to probing common names: q, id, search, query, input, name, data, value, keyword, term",
                    ].map((line) => (
                      <li key={line} className="text-xs flex items-start gap-2">
                        <span
                          className="mt-1 w-1 h-1 rounded-full shrink-0"
                          style={{ background: "#16a34a" }}
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Response Analysis */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2
                      className="w-4 h-4"
                      style={{ color: "#e879f9" }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Response Analysis & Confidence Boosting
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      "Time-based attacks use an adaptive threshold: max(2× baseline, baseline + 3 s, 4 s minimum) to avoid false positives on slow servers.",
                      "Response body diffing: if the body length changes >30% compared to baseline, confidence is automatically boosted for any flagged finding.",
                      "Responses larger than 50 KB are truncated before regex analysis to maintain performance.",
                      "5 requests run concurrently (configurable internally) with up to 2 automatic retries on network errors.",
                    ].map((line) => (
                      <li key={line} className="text-xs flex items-start gap-2">
                        <span
                          className="mt-1 w-1 h-1 rounded-full shrink-0"
                          style={{ background: "#e879f9" }}
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Stop & Resume */}
            <Section id="stop-resume" title="Stop & Resume">
              <p>
                Scans can be paused and resumed at any point without losing
                progress.
              </p>
              <div className="space-y-4 mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <StopCircle
                        className="w-4 h-4"
                        style={{ color: "#dc2626" }}
                      />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Stopping a Scan
                      </span>
                    </div>
                    <p className="text-xs">
                      Click the <strong>Stop</strong> button in the scan detail
                      page at any time. The engine finishes the current batch of
                      requests (up to 5), saves progress, and sets the scan
                      status to <code className="font-mono">stopped</code>. All
                      findings discovered so far are preserved.
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg space-y-2"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" style={{ color: "#16a34a" }} />
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Resuming a Scan
                      </span>
                    </div>
                    <p className="text-xs">
                      On a <code className="font-mono">stopped</code> scan,
                      click <strong>Resume</strong>. The engine rebuilds the
                      full job list and skips all already-completed requests,
                      picking up exactly where it left off. Existing findings
                      and logs are carried forward.
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-2 p-3 rounded-lg"
                  style={{
                    background: "rgba(97,96,176,0.08)",
                    border: "1px solid rgba(97,96,176,0.25)",
                  }}
                >
                  <RefreshCcw
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "#6160b0" }}
                  />
                  <p className="text-xs">
                    Scan state is persisted in the database after every 5
                    completed request batches (or immediately when a
                    vulnerability is found), so progress is never lost even if
                    the server restarts.
                  </p>
                </div>
              </div>
            </Section>

            {/* Reports & Export */}
            <Section id="reports" title="Reports & Export">
              <p>
                Every completed or stopped scan can be exported as a structured
                JSON report from the{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  Reports
                </strong>{" "}
                page.
              </p>
              <div className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Step n={1} title="Open Reports">
                    Click <strong>Reports</strong> in the sidebar. The page
                    lists all completed and stopped scans.
                  </Step>
                  <Step n={2} title="Download a report">
                    Click the <strong>Download</strong> icon next to any scan. A
                    JSON file is saved immediately — no server round-trip after
                    the initial fetch.
                  </Step>
                  <Step n={3} title="Use the report">
                    Import the JSON into your ticket tracker, SIEM, or share it
                    with your team. The file structure is:
                  </Step>
                </div>
                <CodeBlock>{`{
  "reportType": "FuzzX Security Report",
  "generatedAt": "2026-03-30T10:00:00.000Z",
  "scan": { /* full scan config + status */ },
  "summary": {
    "totalVulnerabilities": 4,
    "critical": 1,
    "high": 1,
    "medium": 2,
    "low": 0
  },
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "confidence": "high",
      "parameter": "id",
      "payload": "' AND SLEEP(5)--",
      "evidence": "Response time 5312ms vs baseline 88ms",
      "recommendation": "Use parameterized queries..."
    }
  ]
}`}</CodeBlock>
                <div
                  className="flex items-start gap-2 p-3 rounded-lg"
                  style={{
                    background: "rgba(22,163,74,0.06)",
                    border: "1px solid rgba(22,163,74,0.2)",
                  }}
                >
                  <Download
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "#16a34a" }}
                  />
                  <p className="text-xs">
                    Report filenames are automatically timestamped:{" "}
                    <code
                      className="font-mono"
                      style={{ color: "var(--cyan)" }}
                    >
                      fuzzx-report-&#123;scan-name&#125;-&#123;timestamp&#125;.json
                    </code>
                  </p>
                </div>
              </div>
            </Section>

            {/* Test Targets */}
            <Section id="targets" title="Test Targets (Safe to Scan)">
              <div
                className="flex items-start gap-2 p-3 rounded-lg mb-4"
                style={{
                  background: "rgba(234,179,8,0.08)",
                  border: "1px solid rgba(234,179,8,0.25)",
                }}
              >
                <AlertTriangle
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: "#d97706" }}
                />
                <p className="text-xs">
                  Only scan systems you own or have explicit permission to test.
                  These public sites are intentionally vulnerable and safe to
                  use for testing.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "OWASP Juice Shop",
                    url: "https://juice-shop.herokuapp.com/rest/products/search?q=test",
                    attacks: ["SQLi", "XSS"],
                    notes:
                      "Returns SQLITE_ERROR on SQLi payloads. Best for testing error-based and boolean-based SQLi detection.",
                  },
                  {
                    name: "Altoro Mutual (TestFire)",
                    url: "http://demo.testfire.net/search.jsp?query=test",
                    attacks: ["SQLi", "XSS"],
                    notes:
                      "IBM's intentionally vulnerable banking demo. Tests search and login endpoints.",
                  },
                  {
                    name: "WebScanTest",
                    url: "http://www.webscantest.com/",
                    attacks: ["SQLi", "XSS", "Path Traversal"],
                    notes:
                      "Dedicated scanner test site with multiple vulnerable pages.",
                  },
                ].map(({ name, url, attacks, notes }) => (
                  <div key={name} className="glass-card p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {name}
                      </span>
                      <div className="flex gap-1">
                        {attacks.map((a) => (
                          <Badge key={a} color="#6160b0" label={a} />
                        ))}
                      </div>
                    </div>
                    <code
                      className="block text-xs font-mono break-all"
                      style={{ color: "var(--cyan)" }}
                    >
                      {url}
                    </code>
                    <p className="text-xs">{notes}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
