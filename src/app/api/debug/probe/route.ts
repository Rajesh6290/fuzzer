import { NextRequest, NextResponse } from "next/server";

/**
 * DEBUG PROBE — only for development use.
 * Sends a real HTTP request to any URL and logs the result in the dev terminal.
 *
 * Usage: GET /api/debug/probe?url=https://juice-shop.herokuapp.com/rest/products/search%3Fq%3Dtest
 *
 * Watch your Next.js dev terminal to see the live console.log output.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json({ error: "Missing ?url= param" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Security: only allow http/https
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: "Only http/https URLs allowed" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const start = Date.now();

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  🔍 PROBE REQUEST                                 ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`  → URL        : ${targetUrl.toString()}`);
  console.log(`  → Timestamp  : ${new Date().toISOString()}`);

  try {
    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "FuzzX-Probe/1.0" },
    });

    const elapsed = Date.now() - start;
    const body = await res.text();

    console.log(`  ← Status     : ${res.status} ${res.statusText}`);
    console.log(`  ← Time       : ${elapsed}ms`);
    console.log(`  ← Body size  : ${body.length} bytes`);
    console.log(`  ← Body (500) : ${body.slice(0, 500)}`);
    console.log("──────────────────────────────────────────────────\n");

    return NextResponse.json({
      url: targetUrl.toString(),
      status: res.status,
      statusText: res.statusText,
      responseTimeMs: elapsed,
      bodySize: body.length,
      bodyPreview: body.slice(0, 1000),
      headers: Object.fromEntries(res.headers.entries()),
    });
  } catch (err: unknown) {
    const elapsed = Date.now() - start;
    const msg = err instanceof Error ? err.message : "Unknown error";

    console.log(`  ✗ ERROR      : ${msg}`);
    console.log(`  ← Time       : ${elapsed}ms`);
    console.log("──────────────────────────────────────────────────\n");

    return NextResponse.json({
      url: targetUrl.toString(),
      error: msg,
      responseTimeMs: elapsed,
    }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
