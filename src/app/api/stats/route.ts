import { connectDB } from "@/lib/db";
import { Scan } from "@/models/Scan";
import { Vulnerability } from "@/models/Vulnerability";

export async function GET() {
  try {
    await connectDB();

    const [
      totalScans,
      completedScans,
      runningScans,
      totalVulnerabilities,
      recentScans,
      topVulnTypes,
      severityAgg,
    ] = await Promise.all([
      Scan.countDocuments(),
      Scan.countDocuments({ status: "completed" }),
      Scan.countDocuments({ status: "running" }),
      Vulnerability.countDocuments(),
      Scan.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Vulnerability.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { type: "$_id", count: 1, _id: 0 } },
      ]),
      Vulnerability.aggregate([
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
