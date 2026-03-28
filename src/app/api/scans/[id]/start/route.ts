import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { runFuzzer } from "@/lib/fuzzer/engine";
import mongoose from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid scan ID" }, { status: 400 });
    }

    const scan = await Scan.findById(id);
    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    if (scan.status === "running") {
      return Response.json({ error: "Scan is already running" }, { status: 409 });
    }

    if (scan.status === "completed") {
      return Response.json({ error: "Scan is already completed" }, { status: 409 });
    }
    // stopped and failed are allowed — engine will resume from checkpoint

    // Run fuzzer asynchronously so we can return 202 immediately
    // The engine will update the DB as it progresses
    runFuzzer(id).catch((err) => {
      console.error(`[Fuzzer error for scan ${id}]:`, err);
      Scan.findByIdAndUpdate(id, {
        status: "failed",
        logs: [`[${new Date().toISOString()}] Fatal error: ${String(err)}`],
      }).catch(console.error);
    });

    return Response.json({ message: "Scan started", scanId: id }, { status: 202 });
  } catch (err) {
    console.error("[POST /api/scans/[id]/start]", err);
    return Response.json({ error: "Failed to start scan" }, { status: 500 });
  }
}
