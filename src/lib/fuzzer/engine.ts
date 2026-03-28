import pLimit from "p-limit";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { Vulnerability } from "@/models/Vulnerability";
import { getPayloads, ATTACK_TYPE_LABELS } from "./payloads";
import {
  analyzeSQLI,
  analyzeXSS,
  analyzePathTraversal,
  analyzeCmdInjection,
  analyzeSSRF,
  analyzeOpenRedirect,
  analyzeXXE,
  analyzeLDAP,
  analyzeSSTI,
  analyzeNoSQL,
  analyzeGraphQL,
} from "./analyzer";
import type { AttackType, Severity } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const CONCURRENCY = 5;        // parallel requests at a time
const RETRY_ATTEMPTS = 2;     // retries on network error
const RETRY_DELAY_MS = 400;   // wait between retries
const STATUS_CHECK_EVERY = 10; // check DB stop signal every N requests
const SAVE_EVERY = 5;         // batch save every N completed requests
const MAX_BODY_BYTES = 51_200; // truncate responses to 50KB for analysis
const LOG_BUFFER_SIZE = 1;    // flush every log line for real-time display

// ─── Types ────────────────────────────────────────────────────────────────────
interface FuzzRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  parameter: string;
  payload: string;
  attackType: AttackType;
  timeout: number;
}

interface FuzzResponse {
  statusCode: number;
  responseTime: number;
  body: string;
  headers: Record<string, string>;
  error?: string;
}

// ─── Request Sender (with retry) ─────────────────────────────────────────────
async function sendRequest(req: FuzzRequest, attempt = 0): Promise<FuzzResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeout * 1000);
  const start = Date.now();

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: req.headers,
      signal: controller.signal,
      redirect: "manual",
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      fetchOptions.body = req.body;
    }

    const res = await fetch(req.url, fetchOptions);
    const responseTime = Date.now() - start;

    let body = "";
    try {
      const text = await res.text();
      // Truncate large responses to save memory
      body = text.length > MAX_BODY_BYTES ? text.slice(0, MAX_BODY_BYTES) : text;
    } catch {
      body = "";
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });

    return { statusCode: res.status, responseTime, body, headers };
  } catch (err: unknown) {
    const responseTime = Date.now() - start;
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    // Retry on network errors (not on abort from user stop)
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (!isAbort && attempt < RETRY_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      clearTimeout(timer);
      return sendRequest(req, attempt + 1);
    }

    return { statusCode: 0, responseTime, body: "", headers: {}, error: errorMsg };
  } finally {
    clearTimeout(timer);
  }
}

// ─── Payload Mutation ─────────────────────────────────────────────────────────
function mutatePayload(value: string): string[] {
  const variants: string[] = [value];

  // URL-encoded variant
  try {
    const encoded = encodeURIComponent(value);
    if (encoded !== value) variants.push(encoded);
  } catch { /* skip */ }

  // Double URL-encoded
  try {
    const dbl = encodeURIComponent(encodeURIComponent(value));
    if (!variants.includes(dbl)) variants.push(dbl);
  } catch { /* skip */ }

  // Case variation for SQL keywords (e.g. SELECT → SeLeCt)
  if (/select|union|insert|sleep|waitfor/i.test(value)) {
    const cased = value.replace(/[a-z]/gi, (c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase());
    if (!variants.includes(cased)) variants.push(cased);
  }

  // SQL comment obfuscation (space → /**/)
  if (/\s/.test(value) && /select|union|or|and/i.test(value)) {
    const commented = value.replace(/\s+/g, "/**/");
    if (!variants.includes(commented)) variants.push(commented);
  }

  return variants;
}

// ─── Injection Point Extraction ───────────────────────────────────────────────
function extractInjectionPoints(
  url: string,
  method: string,
  body: string
): { name: string; location: "query" | "body" | "header" }[] {
  const points: { name: string; location: "query" | "body" | "header" }[] = [];

  try {
    const parsed = new URL(url);
    parsed.searchParams.forEach((_, key) => {
      points.push({ name: key, location: "query" });
    });
  } catch { /* not a valid URL */ }

  if (method !== "GET" && body) {
    try {
      const parsed = JSON.parse(body);
      Object.keys(parsed).forEach((key) => {
        if (typeof parsed[key] === "string" || typeof parsed[key] === "number") {
          points.push({ name: key, location: "body" });
        }
      });
    } catch {
      body.split("&").forEach((pair) => {
        const [key] = pair.split("=");
        if (key) points.push({ name: key, location: "body" });
      });
    }
  }

  points.push({ name: "User-Agent", location: "header" });
  points.push({ name: "X-Forwarded-For", location: "header" });

  // If no query/body params found, auto-probe common parameter names
  const hasQueryOrBody = points.some((p) => p.location !== "header");
  if (!hasQueryOrBody) {
    ["q", "id", "search", "query", "input", "name", "data", "value", "keyword", "term"].forEach((p) =>
      points.push({ name: p, location: "query" })
    );
  }

  const seen = new Set<string>();
  return points.filter((p) => {
    const key = `${p.location}:${p.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Request Builder ──────────────────────────────────────────────────────────
function buildRequestWithPayload(
  baseUrl: string,
  method: string,
  baseHeaders: Record<string, string>,
  baseBody: string,
  point: { name: string; location: "query" | "body" | "header" },
  payload: string
): { url: string; headers: Record<string, string>; body: string } {
  let url = baseUrl;
  const headers = { ...baseHeaders };
  let body = baseBody;

  if (point.location === "query") {
    try {
      const parsed = new URL(baseUrl);
      parsed.searchParams.set(point.name, payload);
      url = parsed.toString();
    } catch {
      url = baseUrl + (baseUrl.includes("?") ? "&" : "?") + `${point.name}=${encodeURIComponent(payload)}`;
    }
  } else if (point.location === "body") {
    try {
      const parsed = JSON.parse(body || "{}");
      parsed[point.name] = payload;
      body = JSON.stringify(parsed);
      headers["Content-Type"] = "application/json";
    } catch {
      const params = new URLSearchParams(body);
      params.set(point.name, payload);
      body = params.toString();
    }
  } else if (point.location === "header") {
    headers[point.name] = payload;
  }

  return { url, headers, body };
}

// ─── Analyzer Dispatcher ──────────────────────────────────────────────────────
function analyzeResponse(
  attackType: AttackType,
  payload: string,
  response: FuzzResponse,
  baselineTime: number,
  baselineBody: string
): ReturnType<typeof analyzeSQLI> {
  // Response diffing: flag significant body length change (>30% diff from baseline)
  const baseLen = baselineBody.length || 1;
  const currLen = response.body.length;
  const lenRatio = Math.abs(currLen - baseLen) / baseLen;
  const significantDiff = lenRatio > 0.30 && currLen > 100;

  const result = (() => {
    switch (attackType) {
      case "sqli":
        return analyzeSQLI(response.body, response.statusCode, response.responseTime, payload, baselineTime, baselineBody);
      case "xss":
        return analyzeXSS(response.body, payload);
      case "path_traversal":
        return analyzePathTraversal(response.body);
      case "cmd_injection":
        return analyzeCmdInjection(response.body, response.responseTime, payload, baselineTime);
      case "ssrf":
        return analyzeSSRF(response.body, response.statusCode, payload);
      case "open_redirect":
        return analyzeOpenRedirect(response.headers, response.statusCode);
      case "xxe":
        return analyzeXXE(response.body);
      case "ldap":
        return analyzeLDAP(response.body, response.statusCode);
      case "ssti":
        return analyzeSSTI(response.body, payload);
      case "nosql":
        return analyzeNoSQL(response.body, response.statusCode, payload);
      case "graphql":
        return analyzeGraphQL(response.body, payload);
      default:
        return { isVulnerable: false, severity: "info" as Severity, confidence: "low" as const, evidence: "", description: "", recommendation: "" };
    }
  })();

  // Boost confidence if we see a significant body diff AND already flagged
  if (result.isVulnerable && significantDiff) {
    result.evidence += ` [Response body changed by ${Math.round(lenRatio * 100)}% vs baseline: ${baseLen}B → ${currLen}B]`;
  }

  return result;
}

// ─── Main Fuzzer ──────────────────────────────────────────────────────────────
export async function runFuzzer(scanId: string): Promise<void> {
  await connectDB();

  const scan = await Scan.findById(scanId);
  if (!scan) throw new Error(`Scan ${scanId} not found`);

  const isResume = scan.status === "stopped";

  scan.status = "running";
  if (!isResume) {
    scan.startedAt = new Date();
    scan.logs = [`[${new Date().toISOString()}] Scan started`];
    scan.completedRequests = 0;
    scan.progress = 0;
    scan.findings = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  } else {
    scan.logs.push(`[${new Date().toISOString()}] Scan resumed from request ${scan.completedRequests}`);
  }
  await scan.save();

  const method = scan.method;
  const targetUrl = scan.targetUrl;
  const headersMap: Record<string, string> = {};
  scan.headers.forEach((v: string, k: string) => { headersMap[k] = v; });
  if (scan.cookies) headersMap["Cookie"] = scan.cookies;
  if (!headersMap["Accept"]) headersMap["Accept"] = "text/html,application/json,*/*";

  const injectionPoints = extractInjectionPoints(targetUrl, method, scan.body || "");

  // Build full job list with payload mutations
  type Job = {
    attackType: AttackType;
    point: { name: string; location: "query" | "body" | "header" };
    payload: string;
  };
  const allJobs: Job[] = [];
  for (const attackType of scan.attackTypes as AttackType[]) {
    const payloads = getPayloads(attackType, scan.maxPayloads);
    for (const point of injectionPoints) {
      for (const entry of payloads) {
        const mutations = mutatePayload(entry.value);
        for (const mutated of mutations) {
          allJobs.push({ attackType, point, payload: mutated });
        }
      }
    }
  }

  const totalRequests = allJobs.length;
  scan.totalRequests = Math.max(totalRequests, 1);
  scan.logs.push(`[${new Date().toISOString()}] Total requests planned: ${totalRequests} (incl. mutations)`);
  scan.logs.push(`[${new Date().toISOString()}] Injection points: ${injectionPoints.map((p) => `${p.location}:${p.name}`).join(", ")}`);
  await scan.save();

  // Baseline request
  let baselineTime = 500;
  let baselineBody = "";
  try {
    const baselineRes = await sendRequest({
      url: targetUrl, method, headers: headersMap,
      body: scan.body || "", parameter: "baseline",
      payload: "", attackType: "sqli", timeout: scan.timeout,
    });
    baselineTime = baselineRes.responseTime;
    baselineBody = baselineRes.body;
    scan.logs.push(`[${new Date().toISOString()}] Baseline: ${baselineTime}ms, ${baselineBody.length}B`);
  } catch { /* ignore */ }
  await scan.save();

  const skipCount = isResume ? (scan.completedRequests ?? 0) : 0;
  const jobsToRun = allJobs.slice(skipCount);
  let completedRequests = skipCount;
  const findings = {
    critical: scan.findings?.critical ?? 0,
    high: scan.findings?.high ?? 0,
    medium: scan.findings?.medium ?? 0,
    low: scan.findings?.low ?? 0,
    info: scan.findings?.info ?? 0,
  };

  // Shared mutable state (protected by sequential flush)
  const logBuffer: string[] = [];
  const vulnQueue: InstanceType<typeof Vulnerability>[] = [];
  let stopped = false;

  // Periodic stop-signal checker (replaces per-iteration DB read)
  const stopCheckInterval = setInterval(async () => {
    try {
      const fresh = await Scan.findById(scanId).select("status").lean();
      if (fresh?.status === "stopped") stopped = true;
    } catch { /* ignore */ }
  }, STATUS_CHECK_EVERY * 500);

  // Flush buffer to DB
  async function flush(force = false) {
    if (logBuffer.length >= LOG_BUFFER_SIZE || force) {
      scan!.logs.push(...logBuffer.splice(0));
    }
    if (vulnQueue.length > 0) {
      await Vulnerability.insertMany(vulnQueue.splice(0));
    }
    scan!.completedRequests = completedRequests;
    scan!.progress = Math.min(Math.round((completedRequests / Math.max(totalRequests, 1)) * 100), 99);
    scan!.findings = findings;
    await scan!.save();
  }

  const limiter = pLimit(CONCURRENCY);
  let batchCount = 0;

  // Group jobs into batches of CONCURRENCY
  const chunks: Job[][] = [];
  for (let i = 0; i < jobsToRun.length; i += CONCURRENCY) {
    chunks.push(jobsToRun.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    if (stopped) break;

    await Promise.all(chunk.map((job) =>
      limiter(async () => {
        if (stopped) return;

        const { url: fuzzUrl, headers: fuzzHeaders, body: fuzzBody } = buildRequestWithPayload(
          targetUrl, method, headersMap, scan.body || "", job.point, job.payload
        );

        const response = await sendRequest({
          url: fuzzUrl, method, headers: fuzzHeaders, body: fuzzBody,
          parameter: job.point.name, payload: job.payload,
          attackType: job.attackType, timeout: scan.timeout,
        });

        completedRequests++;

        const analysis = analyzeResponse(job.attackType, job.payload, response, baselineTime, baselineBody);

        let urlPath = fuzzUrl;
        try { urlPath = new URL(fuzzUrl).pathname + new URL(fuzzUrl).search; } catch { /* keep full */ }
        if (urlPath.length > 70) urlPath = urlPath.slice(0, 70) + "…";

        if (analysis.isVulnerable) {
          vulnQueue.push(new Vulnerability({
            scanId: scan!._id,
            type: ATTACK_TYPE_LABELS[job.attackType] ?? job.attackType,
            severity: analysis.severity,
            confidence: analysis.confidence,
            url: fuzzUrl,
            method,
            parameter: job.point.name,
            payload: job.payload,
            statusCode: response.statusCode,
            responseTime: response.responseTime,
            evidence: analysis.evidence,
            description: analysis.description,
            recommendation: analysis.recommendation,
            detectedAt: new Date(),
          }));
          findings[analysis.severity as keyof typeof findings]++;
          logBuffer.push(
            `[${new Date().toISOString()}] [${analysis.severity.toUpperCase()}] [${analysis.confidence.toUpperCase()} CONFIDENCE] method=${method} | url=${urlPath} | param=${job.point.name} | loc=${job.point.location} | payload=${job.payload.slice(0, 60)} | status=${response.statusCode} | ${response.responseTime}ms | VULNERABLE`
          );
        } else if (response.error) {
          logBuffer.push(
            `[${new Date().toISOString()}] [ERR] method=${method} | url=${urlPath} | param=${job.point.name} | loc=${job.point.location} | payload=${job.payload.slice(0, 40)} | error=${response.error.slice(0, 60)}`
          );
        } else {
          logBuffer.push(
            `[${new Date().toISOString()}] [OK] method=${method} | url=${urlPath} | param=${job.point.name} | loc=${job.point.location} | payload=${job.payload.slice(0, 40)} | status=${response.statusCode} | ${response.responseTime}ms | clean`
          );
        }
      })
    ));

    batchCount++;

    // Flush every SAVE_EVERY batches or on new findings
    if (batchCount % SAVE_EVERY === 0 || vulnQueue.length > 0) {
      await flush();
    }

    // Optional delay between batches
    if (scan.delay > 0) {
      await new Promise((r) => setTimeout(r, scan.delay));
    }
  }

  clearInterval(stopCheckInterval);
  await flush(true);

  // Final save
  const freshFinal = await Scan.findById(scanId).select("status").lean();
  const finalStatus = freshFinal?.status === "stopped" ? "stopped" : "completed";

  scan.status = finalStatus;
  scan.progress = finalStatus === "completed" ? 100 : scan.progress;
  scan.completedAt = new Date();
  scan.findings = findings;
  scan.logs.push(
    `[${new Date().toISOString()}] Scan ${finalStatus}. Vulnerabilities: Critical=${findings.critical}, High=${findings.high}, Medium=${findings.medium}, Low=${findings.low}`
  );
  await scan.save();
}
