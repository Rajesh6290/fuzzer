import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const USERNAME_RE = /^[a-z0-9_]{3,32}$/i;

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.trim() ?? "";

  if (!USERNAME_RE.test(username)) {
    return Response.json({ available: false, reason: "invalid" });
  }

  await connectDB();
  const exists = await User.exists({ username: username.toLowerCase() });
  return Response.json({ available: !exists, reason: exists ? "taken" : "ok" });
}
