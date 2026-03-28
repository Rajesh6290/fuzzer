import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      // Use constant-time comparison to prevent username enumeration
      await bcrypt.compare(password, "$2b$10$invalidhashusedfortiming00000000000000000000000");
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await createSession(user._id.toString(), user.username);
    return Response.json({ username: user.username });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
