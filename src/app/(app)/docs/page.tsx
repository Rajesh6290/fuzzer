"use client";

import { useState } from "react";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PageWrapper from "@/components/PageWrapper";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "new-scan", label: "Creating a Scan" },
  { id: "attack-types", label: "Attack Types" },
  { id: "options", label: "Scan Options" },
  { id: "results", label: "Reading Results" },
  { id: "activity-log", label: "Activity Log" },
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
      className="scroll-mt-6"
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
      className="p-3 rounded-lg text-xs font-mono overflow-x-auto"
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
        className="text-xs font-mono px-2 py-1 rounded"
        style={{ background: "var(--bg-secondary)", color: "#c2410c" }}
      >
        {example}
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar title="Documentation" subtitle="Complete guide to using FuzzX" />
      <PageWrapper>
        <div className="flex gap-8 max-w-6xl mx-auto">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-6 space-y-1">
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
                    className="flex gap-3 p-3 rounded-lg"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="shrink-0 w-36">
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
                  desc="Detects error-based, boolean-based blind, and time-based blind SQL injection. Checks for DB error messages in response body and response time spikes."
                  example="' OR 1=1-- / ' AND SLEEP(5)--"
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
                  desc="Injects shell command separators and sleep commands to detect OS command execution. Uses time-based detection."
                  example="; sleep 5 # / | whoami"
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
                  desc="Injects external URLs into redirect parameters and checks if the response location header points to the injected domain."
                  example="https://evil.com"
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
                  desc="Injects LDAP special characters and filter bypass payloads into parameters used for directory lookups or authentication."
                  example="*)(uid=*))(|(uid=*"
                />
                <AttackCard
                  icon={Layers}
                  color="#a78bfa"
                  name="SSTI"
                  desc="Server-Side Template Injection. Injects template expression syntax for Jinja2, Twig, FreeMarker, Pebble, and others."
                  example="{{7*7}} / ${7*7} / <%= 7*7 %>"
                />
                <AttackCard
                  icon={Hash}
                  color="#34d399"
                  name="NoSQL Injection"
                  desc="Injects MongoDB operator payloads to bypass authentication or extract data from NoSQL databases."
                  example='{"$ne": null} / [$gt]=&[$ne]=x'
                />
                <AttackCard
                  icon={Settings}
                  color="#fb923c"
                  name="GraphQL"
                  desc="Sends introspection queries and type enumeration payloads to detect exposed GraphQL endpoints and schema leakage."
                  example="{__schema{types{name}}}"
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
      </PageWrapper>
    </>
  );
}
