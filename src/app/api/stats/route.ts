import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { Vulnerability } from "@/models/Vulnerability";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    // Get scan IDs belonging to this user for vulnerability scoping
    const userScanIds = await Scan.find({ userId: session.userId }).distinct("_id");

    const [
      totalScans,
      completedScans,
      runningScans,
      totalVulnerabilities,
      recentScans,
      topVulnTypes,
      severityAgg,
    ] = await Promise.all([
      Scan.countDocuments({ userId: session.userId }),
      Scan.countDocuments({ userId: session.userId, status: "completed" }),
      Scan.countDocuments({ userId: session.userId, status: "running" }),
      Vulnerability.countDocuments({ scanId: { $in: userScanIds } }),
      Scan.find({ userId: session.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Vulnerability.aggregate([
        { $match: { scanId: { $in: userScanIds } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { type: "$_id", count: 1, _id: 0 } },
      ]),
      Vulnerability.aggregate([
        { $match: { scanId: { $in: userScanIds } } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
    ]);

    const findings = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const item of severityAgg as { _id: string; count: number }[]) {
      const key = item._id as keyof typeof findings;
      if (key in findings) findings[key] = item.count;
    }

    return Response.json({
      totalScans,
      completedScans,
      runningScans,
      totalVulnerabilities,
      findings,
      recentScans,
      topVulnTypes,
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
