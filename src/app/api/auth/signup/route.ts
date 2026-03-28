import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createSession } from "@/lib/session";

const USERNAME_RE = /^[a-z0-9_]{3,32}$/i;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!USERNAME_RE.test(username)) {
      return Response.json(
        { error: "Username must be 3–32 characters (letters, numbers, underscores)" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const exists = await User.exists({ username: username.toLowerCase().trim() });
    if (exists) {
      return Response.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.toLowerCase().trim(),
      passwordHash,
    });

    await createSession(user._id.toString(), user.username);
    return Response.json({ username: user.username }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
