export type AttackType =
  | "sqli"
  | "xss"
  | "path_traversal"
  | "cmd_injection"
  | "ssrf"
  | "open_redirect"
  | "xxe"
  | "ldap"
  | "ssti"
  | "nosql"
  | "graphql";

export type ScanStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ScanConfig {
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: string;
  attackTypes: AttackType[];
  timeout: number;      // seconds
  delay: number;        // ms between requests
  maxPayloads: number;  // per attack type
  followRedirects: boolean;
  cookies: string;
}

export interface VulnerabilityDoc {
  _id: string;
  scanId: string;
  type: string;
  severity: Severity;
  confidence: "low" | "medium" | "high";
  url: string;
  method: string;
  parameter: string;
  payload: string;
  statusCode: number;
  responseTime: number;
  evidence: string;
  description: string;
  recommendation: string;
  detectedAt: string;
}

export interface ScanDoc {
  _id: string;
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body: string;
  attackTypes: AttackType[];
  timeout: number;
  delay: number;
  maxPayloads: number;
  followRedirects: boolean;
  cookies: string;
  status: ScanStatus;
  progress: number;
  totalRequests: number;
  completedRequests: number;
  currentActivity: string;
  logs: string[];
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  vulnerabilities?: VulnerabilityDoc[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatsDoc {
  totalScans: number;
  completedScans: number;
  runningScans: number;
  totalVulnerabilities: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  recentScans: ScanDoc[];
  topVulnTypes: { type: string; count: number }[];
}
