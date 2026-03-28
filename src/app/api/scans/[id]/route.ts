import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { Vulnerability } from "@/models/Vulnerability";
import { getSession } from "@/lib/session";
import mongoose from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid scan ID" }, { status: 400 });
    }

    const scan = await Scan.findOne({ _id: id, userId: session.userId }).lean();
    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    const vulnerabilities = await Vulnerability.find({ scanId: id })
      .sort({ detectedAt: -1 })
      .lean();

    return Response.json({ scan, vulnerabilities });
  } catch (err) {
    console.error("[GET /api/scans/[id]]", err);
    return Response.json({ error: "Failed to fetch scan" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
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

    if (scan.status === "running") {
      return Response.json({ error: "Stop the scan before deleting" }, { status: 409 });
    }

    await Promise.all([
      Scan.deleteOne({ _id: id }),
      Vulnerability.deleteMany({ scanId: id }),
    ]);

    return Response.json({ message: "Scan deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/scans/[id]]", err);
    return Response.json({ error: "Failed to delete scan" }, { status: 500 });
  }
}
