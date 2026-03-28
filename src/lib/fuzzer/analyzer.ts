import type { Severity } from "@/types";

export interface AnalysisResult {
  isVulnerable: boolean;
  severity: Severity;
  confidence: "low" | "medium" | "high";
  evidence: string;
  description: string;
  recommendation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Truncate response body before regex to prevent performance issues on large responses */
const MAX_REGEX_BODY = 50_000;
function trunc(body: string): string {
  return body.length > MAX_REGEX_BODY ? body.slice(0, MAX_REGEX_BODY) : body;
}

/** Adaptive time threshold: 2× baseline OR baseline+3s, minimum 4s absolute */
function timeThreshold(baselineTime: number): number {
  return Math.max(baselineTime * 2, baselineTime + 3000, 4000);
}

/** Response body length change ratio vs baseline */
function bodyDiff(baselineBody: string, testBody: string): number {
  const baseLen = Math.max(baselineBody.length, 1);
  return Math.abs(testBody.length - baseLen) / baseLen;
}

const NOT_VULNERABLE: AnalysisResult = {
  isVulnerable: false, severity: "info", confidence: "low",
  evidence: "", description: "", recommendation: "",
};

// ─── SQL Injection Patterns ───────────────────────────────────────────────────
const SQL_ERROR_PATTERNS = [
  /you have an error in your sql syntax/i,
  /warning: mysql/i,
  /unclosed quotation mark after the character string/i,
  /quoted string not properly terminated/i,
  /pg_query\(\): query failed/i,
  /supplied argument is not a valid mysql/i,
  /syntax error or access violation/i,
  /odbc sql server driver/i,
  /microsoft ole db provider for sql server/i,
  /sqlite[_\s]error/i,
  /sqlite.*syntax error/i,
  /near\s+"[^"]+"\s*:\s*syntax error/i,
  /sequelizedatabaseerror/i,
  /sequelizeuniqueconstrainterror/i,
  /ora-\d+/i,
  /db2 sql error/i,
  /sql syntax.*near/i,
  /unexpected end of sql command/i,
  /sql command not properly ended/i,
  /unhandledpromiserejectionwarning.*sql/i,
];


// ─── SQL Injection ────────────────────────────────────────────────────────────
export function analyzeSQLI(
  responseBody: string,
  statusCode: number,
  responseTime: number,
  payload: string,
  baselineTime: number,
  baselineBody = ""
): AnalysisResult {
  const body = trunc(responseBody);
  const threshold = timeThreshold(baselineTime);
  const payloadLc = payload.toLowerCase();

  // 1. Time-based blind (adaptive threshold)
  if (
    (payloadLc.includes("sleep") || payloadLc.includes("waitfor") || payloadLc.includes("randomblob")) &&
    responseTime > threshold
  ) {
    const delay = responseTime - baselineTime;
    return {
      isVulnerable: true, severity: "critical",
      confidence: delay > threshold * 1.5 ? "high" : "medium",
      evidence: `Response time ${responseTime}ms vs baseline ${baselineTime}ms (adaptive threshold: ${threshold}ms). Delay of ${delay}ms indicates time-based blind SQLi.`,
      description: "Time-based blind SQL injection detected. The application paused execution in response to the injected sleep/delay payload.",
      recommendation: "Use parameterized queries for all DB interactions. Never concatenate user input into SQL strings.",
    };
  }

  // 2. Error-based — early exit on first match
  const errorMatch = SQL_ERROR_PATTERNS.find((p) => p.test(body));
  if (errorMatch) {
    const matched = body.match(errorMatch)?.[0] ?? "";
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `SQL error in response: "${matched.slice(0, 200)}"`,
      description: "Error-based SQL injection detected. A database error was returned revealing query structure.",
      recommendation: "Use parameterized queries and suppress all DB errors in production.",
    };
  }

  // 3. Boolean-based: response body differs significantly from baseline (response diffing)
  if (baselineBody) {
    const diff = bodyDiff(baselineBody, responseBody);
    if (diff > 0.35 && statusCode === 200) {
      return {
        isVulnerable: true, severity: "high", confidence: "medium",
        evidence: `Response body changed by ${Math.round(diff * 100)}% vs baseline (${baselineBody.length}B → ${responseBody.length}B) on SQLi payload — suggests boolean-based blind injection.`,
        description: "Possible boolean-based blind SQL injection. Response body differs significantly from baseline when SQLi payload is injected.",
        recommendation: "Use parameterized queries. Investigate parameter handling in DB queries.",
      };
    }
  }

  // 4. HTTP 500 on SQL payload
  if (statusCode === 500) {
    return {
      isVulnerable: true, severity: "high", confidence: "medium",
      evidence: `HTTP 500 returned on SQL payload — possible unhandled DB exception.`,
      description: "The server returned 500 in response to a SQL injection payload, suggesting the payload disrupted a query.",
      recommendation: "Use parameterized queries and global exception handling.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── XSS ──────────────────────────────────────────────────────────────────────
export function analyzeXSS(responseBody: string, payload: string): AnalysisResult {
  const body = trunc(responseBody);
  const snippet = payload.slice(0, 60);

  if (!body.includes(snippet)) return { ...NOT_VULNERABLE };

  const escaped = payload
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  if (body.includes(escaped)) return { ...NOT_VULNERABLE };

  const idx = body.indexOf(snippet);
  const surrounding = body.slice(Math.max(0, idx - 40), idx + snippet.length + 40).replace(/\s+/g, " ");
  const before = body.slice(0, idx);
  const lastScriptOpen = before.lastIndexOf("<script");
  const scriptTagOpen = lastScriptOpen !== -1 &&
    /<script\b[^>]*>/i.test(before.slice(lastScriptOpen)) &&
    !/<\/script>/i.test(before.slice(lastScriptOpen));
  const hasTagChars = /[<>]/.test(payload);
  const inAttribute = /=["'][^"']*$/.test(before.slice(Math.max(0, before.length - 80)));

  if (scriptTagOpen || hasTagChars) {
    return {
      isVulnerable: true, severity: "high", confidence: "high",
      evidence: `Payload reflected unescaped in ${scriptTagOpen ? "script" : "HTML tag"} context: "...${surrounding}..."`,
      description: "Reflected XSS detected. User-supplied input echoed without HTML encoding in an executable context.",
      recommendation: "Encode all user input before reflecting in HTML. Implement Content Security Policy (CSP).",
    };
  }

  if (inAttribute) {
    return {
      isVulnerable: true, severity: "medium", confidence: "medium",
      evidence: `Payload reflected in HTML attribute without encoding: "...${surrounding}..."`,
      description: "Reflected XSS in attribute context. Input in an HTML attribute without encoding can allow event handler injection.",
      recommendation: "Use attribute-context encoding. Validate and allowlist attribute values.",
    };
  }

  return {
    isVulnerable: true, severity: "medium", confidence: "low",
    evidence: `Payload reflected without encoding in response body: "...${surrounding}..."`,
    description: "Possible reflected XSS. Input appears in the response without encoding — context could not be fully confirmed.",
    recommendation: "Encode all user input before reflecting in HTML. Implement Content Security Policy.",
  };
}

// ─── Path Traversal ───────────────────────────────────────────────────────────
export function analyzePathTraversal(responseBody: string): AnalysisResult {
  const body = trunc(responseBody);
  const unixSignals = [/root:.*:0:0:/i, /bin\/bash/i, /home\/\w+:/i, /proc\/version/i];
  const winSignals = /\[boot loader\]|\[operating systems\]/i;
  const envSignals = /PATH=\/usr\/local\/sbin/i;

  if (unixSignals.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `Unix system file contents detected in response (/etc/passwd format).`,
      description: "Path traversal detected. Arbitrary files including /etc/passwd are readable.",
      recommendation: "Sanitize file path inputs using an allowlist. Validate resolved path stays within expected base directory.",
    };
  }

  if (winSignals.test(body)) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `Windows system file contents (boot.ini / hosts) detected in response.`,
      description: "Path traversal detected. Windows system files readable via directory traversal.",
      recommendation: "Validate and normalize file paths. Reject paths resolving outside base directory.",
    };
  }

  if (envSignals.test(body)) {
    return {
      isVulnerable: true, severity: "high", confidence: "high",
      evidence: `Linux /proc/self/environ contents detected — environment variables exposed.`,
      description: "Path traversal allows reading process environment variables, potentially exposing secrets.",
      recommendation: "Restrict /proc access. Validate all file-related parameters against an allowlist.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── Command Injection ────────────────────────────────────────────────────────
export function analyzeCmdInjection(
  responseBody: string,
  responseTime: number,
  payload: string,
  baselineTime: number
): AnalysisResult {
  const body = trunc(responseBody);
  const threshold = timeThreshold(baselineTime);
  const payloadLc = payload.toLowerCase();

  const cmdOutputSignals = [
    /uid=\d+\(\w+\)/i,
    /total \d+\n[-drwx]{10}/i,
    /volume in drive [a-z]/i,
    /bin\/(bash|sh|zsh)/i,
    /linux version \d+\./i,
    / nobody| root | daemon /i,
  ];

  if (cmdOutputSignals.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `Command execution output detected in response.`,
      description: "Remote Command Injection detected. The server executed an OS command and returned output.",
      recommendation: "Never pass user input to shell functions. Use language-native APIs with explicit argument arrays.",
    };
  }

  if (
    (payloadLc.includes("sleep") || payloadLc.includes("ping") || payloadLc.includes("waitfor")) &&
    responseTime > threshold
  ) {
    const delay = responseTime - baselineTime;
    return {
      isVulnerable: true, severity: "critical",
      confidence: delay > threshold * 1.5 ? "high" : "medium",
      evidence: `Time-based command injection: ${responseTime}ms vs baseline ${baselineTime}ms (threshold: ${threshold}ms). Delay: ${delay}ms.`,
      description: "Time-based blind command injection detected. The injected sleep/ping caused a measurable server delay.",
      recommendation: "Avoid OS command execution in web apps. Sanitize all inputs. Use subprocess libraries with argument arrays.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── SSRF ─────────────────────────────────────────────────────────────────────
export function analyzeSSRF(
  responseBody: string,
  statusCode: number,
  payload: string
): AnalysisResult {
  const body = trunc(responseBody);
  const internalSignals = [
    /aws.*security.*credentials/i,
    /169\.254\.169\.254/i,
    /instance-id/i,
    /ami-id/i,
    /metadata\.google\.internal/i,
    /computeMetadata/i,
    /root:.*:0:0:/i,
  ];

  if (internalSignals.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `Internal/cloud metadata response detected: "${body.slice(0, 200)}"`,
      description: "SSRF detected. The server fetched an internal endpoint and returned its contents, exposing cloud credentials or internal data.",
      recommendation: "Allowlist URLs for server-side requests. Block private IPs and cloud metadata ranges. Implement egress firewall rules.",
    };
  }

  if (
    (payload.includes("127.0.0.1") || payload.includes("localhost") || payload.includes("169.254")) &&
    statusCode === 200
  ) {
    return {
      isVulnerable: true, severity: "high", confidence: "medium",
      evidence: `HTTP 200 returned when requesting internal address: ${payload}`,
      description: "Potential SSRF. Server successfully fetched an internal address, indicating it proxies requests to internal services.",
      recommendation: "Implement URL allowlist. Block RFC1918 address ranges from server-side HTTP fetchers.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── Open Redirect ────────────────────────────────────────────────────────────
export function analyzeOpenRedirect(
  responseHeaders: Record<string, string>,
  statusCode: number
): AnalysisResult {
  const isRedirect = statusCode >= 300 && statusCode < 400;
  const location = responseHeaders["location"] ?? responseHeaders["Location"] ?? "";

  if (isRedirect && (location.includes("evil.com") || location.startsWith("javascript:") || location.startsWith("data:"))) {
    return {
      isVulnerable: true, severity: "medium", confidence: "high",
      evidence: `Redirect to external URL. Location header: "${location}"`,
      description: "Open Redirect detected. The application redirects to an attacker-controlled URL, enabling phishing.",
      recommendation: "Validate redirect URLs against a strict allowlist. Use relative paths. Never redirect to URLs from user input.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── XXE ──────────────────────────────────────────────────────────────────────
export function analyzeXXE(responseBody: string): AnalysisResult {
  const body = trunc(responseBody);
  const xxeSignals = [/root:.*:0:0:/i, /\[boot loader\]/i, /<!DOCTYPE/i];

  if (xxeSignals.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `XXE payload output detected: "${body.slice(0, 200)}"`,
      description: "XXE injection detected. The XML parser processed external entities, enabling file disclosure or SSRF.",
      recommendation: "Disable external entity processing in your XML parser. Validate and sanitize all XML input.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── LDAP ─────────────────────────────────────────────────────────────────────
export function analyzeLDAP(responseBody: string, statusCode: number): AnalysisResult {
  const body = trunc(responseBody);
  const ldapData = [/uid=\w+,/i, /cn=\w+,/i, /dc=\w+,/i];
  const ldapErrors = [/ldap.*error/i, /invalid credentials/i, /javax\.naming\.ldap/i, /activedirectorymembership/i];

  if (ldapData.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "high", confidence: "high",
      evidence: `LDAP directory data in response: ${body.slice(0, 200)}`,
      description: "LDAP Injection detected. The payload modified the LDAP query and directory entry data was returned.",
      recommendation: "Use LDAP escaping functions. Implement parameterized LDAP queries. Restrict LDAP service user permissions.",
    };
  }

  if (ldapErrors.some((p) => p.test(body)) && statusCode !== 400) {
    return {
      isVulnerable: true, severity: "medium", confidence: "medium",
      evidence: `LDAP error in response suggests the payload interfered with query structure.`,
      description: "Potential LDAP injection. An LDAP error was triggered by the injected input.",
      recommendation: "Use LDAP escaping for all user inputs. Implement error handling that hides LDAP-related errors.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── SSTI ─────────────────────────────────────────────────────────────────────
export function analyzeSSTI(responseBody: string, payload: string): AnalysisResult {
  const body = trunc(responseBody);
  const mathProbes: Array<{ expr: RegExp; result: string }> = [
    { expr: /\{\{7\*7\}\}|\$\{7\*7\}|#\{7\*7\}|\*\{7\*7\}|<%=\s*7\*7\s*%>|@\(7\*7\)/, result: "49" },
    { expr: /\{\{7\*'7'\}\}/, result: "7777777" },
  ];

  for (const probe of mathProbes) {
    if (probe.expr.test(payload) && body.includes(probe.result)) {
      return {
        isVulnerable: true, severity: "critical", confidence: "high",
        evidence: `Template expression "${payload}" evaluated — result "${probe.result}" in response confirms server-side template execution.`,
        description: "SSTI detected. The application evaluated a template expression from user input, allowing arbitrary code execution.",
        recommendation: "Never pass user input to template engines. Use sandboxed rendering. Reject template syntax characters.",
      };
    }
  }

  if (/\bconfigobj\b|<Config\s|\bDEBUG\b.*\bSECRET_KEY\b/i.test(body)) {
    return {
      isVulnerable: true, severity: "critical", confidence: "medium",
      evidence: `Application config/debug object detected in response, likely via SSTI payload.`,
      description: "SSTI leaked application configuration including potential secret keys.",
      recommendation: "Sanitize template inputs. Disable debug output. Rotate any exposed secrets immediately.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── NoSQL ────────────────────────────────────────────────────────────────────
export function analyzeNoSQL(responseBody: string, statusCode: number, payload: string): AnalysisResult {
  const body = trunc(responseBody);
  const authBypassSignals = [/"token":/i, /"jwt":/i, /"access_token":/i, /"logged_in":\s*true/i, /"success":\s*true/i];
  const errorSignals = [/castError/i, /MongoError/i, /mongoose/i, /BSON/i, /ObjectId/i];

  if (authBypassSignals.some((p) => p.test(body)) && (payload.includes("$ne") || payload.includes("$gt") || payload.includes("$regex"))) {
    return {
      isVulnerable: true, severity: "critical", confidence: "high",
      evidence: `Auth token/success response returned on NoSQL operator payload "${payload.slice(0, 80)}".`,
      description: "NoSQL Injection (Auth Bypass) detected. MongoDB operators bypassed authentication and returned session credentials.",
      recommendation: "Validate inputs before passing to MongoDB. Use Mongoose strict mode. Block operator keys ($gt, $ne, $regex) from user input.",
    };
  }

  if (errorSignals.some((p) => p.test(body))) {
    return {
      isVulnerable: true, severity: "high", confidence: "medium",
      evidence: `MongoDB/Mongoose error leaked in response after NoSQL payload injection.`,
      description: "NoSQL Injection (Error-Based). The injected operator caused a DB error reflected in the response.",
      recommendation: "Sanitize all inputs. Implement global error handling that hides ORM/DB error details.",
    };
  }

  return { ...NOT_VULNERABLE };
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────
export function analyzeGraphQL(responseBody: string, payload: string): AnalysisResult {
  const body = trunc(responseBody);

  if (/"__schema"/i.test(body) && /"types"/i.test(body)) {
    return {
      isVulnerable: true, severity: "medium", confidence: "high",
      evidence: `GraphQL introspection returned full schema — "__schema" and "types" in response.`,
      description: "GraphQL Introspection is enabled. Attackers can enumerate all API types, queries, and mutations.",
      recommendation: "Disable introspection in production. Implement query depth/complexity limits. Use schema allow-listing.",
    };
  }

  if (/"errors"/i.test(body) && (/"locations"/i.test(body) || /"path"/i.test(body))) {
    if (payload.includes("OR 1=1") || payload.includes("\\\"") || payload.includes("'")) {
      return {
        isVulnerable: true, severity: "high", confidence: "medium",
        evidence: `GraphQL structured error returned after injection payload, suggesting the payload reached a resolver.`,
        description: "GraphQL Injection (Error-Based). Injected payload caused a GraphQL error indicating insufficient input sanitization.",
        recommendation: "Validate all resolver inputs. Use parameterized DB queries in resolvers. Implement query allow-listing.",
      };
    }
  }

  return { ...NOT_VULNERABLE };
}
