import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { userId: session.userId };
    if (status) query.status = status;
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      Scan.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Scan.countDocuments(query),
    ]);

    return Response.json({ scans, total, page, limit });
  } catch (err) {
    console.error("[GET /api/scans]", err);
    return Response.json({ error: "Failed to fetch scans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      targetUrl,
      method = "GET",
      headers = {},
      requestBody = "",
      attackTypes = [],
      timeout = 5,
      delay = 0,
      maxPayloads = 15,
      followRedirects = false,
      cookies = "",
    } = body;

    if (!name || !targetUrl) {
      return Response.json({ error: "name and targetUrl are required" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(targetUrl);
    } catch {
      return Response.json({ error: "Invalid target URL" }, { status: 400 });
    }

    const VALID_ATTACK_TYPES = [
      "sqli", "xss", "path_traversal", "cmd_injection",
      "ssrf", "open_redirect", "xxe", "ldap",
      "ssti", "nosql", "graphql",
    ];

    if (!Array.isArray(attackTypes) || attackTypes.length === 0) {
      return Response.json({ error: "At least one attack type is required" }, { status: 400 });
    }

    const invalidTypes = attackTypes.filter((t: string) => !VALID_ATTACK_TYPES.includes(t));
    if (invalidTypes.length > 0) {
      return Response.json({ error: `Invalid attack types: ${invalidTypes.join(", ")}` }, { status: 400 });
    }

    const headersMap = new Map<string, string>(Object.entries(headers));

    const scan = new Scan({
      userId: session.userId,
      name,
      targetUrl,
      method,
      headers: headersMap,
      body: requestBody,
      attackTypes,
      timeout: Math.min(Math.max(timeout, 1), 30),
      delay: Math.min(Math.max(delay, 0), 5000),
      maxPayloads: Math.min(Math.max(maxPayloads, 1), 50),
      followRedirects,
      cookies,
      status: "pending",
    });

    await scan.save();

    return Response.json({ scan }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/scans]", err);
    return Response.json({ error: "Failed to create scan" }, { status: 500 });
  }
}
