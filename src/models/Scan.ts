import mongoose, { Schema, Document, Model } from "mongoose";
import type { ScanStatus, HttpMethod, AttackType } from "@/types";

export interface IScan extends Document {
  name: string;
  targetUrl: string;
  method: HttpMethod;
  headers: Map<string, string>;
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
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    name: { type: String, required: true },
    targetUrl: { type: String, required: true },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      default: "GET",
    },
    headers: { type: Map, of: String, default: {} },
    body: { type: String, default: "" },
    attackTypes: [
      {
        type: String,
        enum: [
          "sqli",
          "xss",
          "path_traversal",
          "cmd_injection",
          "ssrf",
          "open_redirect",
          "xxe",
          "ldap",
          "ssti",
          "nosql",
          "graphql",
        ],
      },
    ],
    timeout: { type: Number, default: 5 },
    delay: { type: Number, default: 0 },
    maxPayloads: { type: Number, default: 15 },
    followRedirects: { type: Boolean, default: false },
    cookies: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "stopped"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    completedRequests: { type: Number, default: 0 },
    currentActivity: { type: String, default: "" },
    logs: [{ type: String }],
    findings: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 },
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Scan: Model<IScan> =
  mongoose.models.Scan || mongoose.model<IScan>("Scan", ScanSchema);
