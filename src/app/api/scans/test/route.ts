import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { runFuzzer } from "@/lib/fuzzer/engine";
import { getSession } from "@/lib/session";

/**
 * POST /api/scans/test
 *
 * Creates a quick test scan against httpbin.org and immediately starts it.
 * Useful for verifying the fuzzer pipeline end-to-end without a real target.
 *
 * Optional body (all fields have safe defaults):
 * {
 *   "name": "My Test Scan",
 *   "targetUrl": "https://httpbin.org/get",
 *   "attackTypes": ["xss", "sqli"]
 * }
 *
 * Returns 201 + { scanId, pollUrl } to poll GET /api/scans/:id for progress.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // no body — all fields are optional
    }

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : `Test Scan – ${new Date().toLocaleString()}`;

    const targetUrl =
      typeof body.targetUrl === "string" && body.targetUrl.trim()
        ? body.targetUrl.trim()
        : "https://httpbin.org/get";

    try {
      new URL(targetUrl);
    } catch {
      return Response.json({ error: "Invalid targetUrl" }, { status: 400 });
    }

    const VALID_ATTACK_TYPES = [
      "sqli", "xss", "path_traversal", "cmd_injection",
      "ssrf", "open_redirect", "xxe", "ldap",
      "ssti", "nosql", "graphql",
    ];

    const requestedTypes = Array.isArray(body.attackTypes)
      ? (body.attackTypes as string[]).filter((t) => VALID_ATTACK_TYPES.includes(t))
      : [];

    const attackTypes =
      requestedTypes.length > 0 ? requestedTypes : ["xss", "sqli", "path_traversal"];

    const scan = await Scan.create({
      userId: session.userId,
      name,
      targetUrl,
      method: "GET",
      headers: new Map<string, string>(),
      body: "",
      attackTypes,
      timeout: 8,
      delay: 100,
      maxPayloads: 5,
      followRedirects: true,
      cookies: "",
      status: "pending",
    });

    const scanId = scan._id.toString();

    runFuzzer(scanId).catch((err) => {
      console.error(`[test-scan fuzzer error ${scanId}]:`, err);
      Scan.findByIdAndUpdate(scanId, {
        status: "failed",
        logs: [`[${new Date().toISOString()}] Fatal error: ${String(err)}`],
      }).catch(console.error);
    });

    return Response.json(
      { message: "Test scan started", scanId, targetUrl, attackTypes, pollUrl: `/api/scans/${scanId}` },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/scans/test]", err);
    return Response.json({ error: "Failed to create test scan" }, { status: 500 });
  }
}
