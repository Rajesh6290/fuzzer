import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { getSession } from "@/lib/session";
import mongoose from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid scan ID" }, { status: 400 });
    }

    const scan = await Scan.findOne({ _id: id, userId: session.userId });
    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    if (scan.status !== "running") {
      return Response.json({ error: "Scan is not running" }, { status: 409 });
    }

    // Set status to stopped; the engine checks this flag and will exit its loop
    scan.status = "stopped";
    scan.logs.push(`[${new Date().toISOString()}] Stop signal received`);
    await scan.save();

    return Response.json({ message: "Stop signal sent", scanId: id });
  } catch (err) {
    console.error("[POST /api/scans/[id]/stop]", err);
    return Response.json({ error: "Failed to stop scan" }, { status: 500 });
  }
}
