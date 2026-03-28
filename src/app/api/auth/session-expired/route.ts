import { type NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

/**
 * Called server-side when the session user no longer exists in the DB.
 * Clears the session cookie and redirects to login.
 */
export async function GET(req: NextRequest) {
  await deleteSession();
  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("reason", "session_expired");
  return NextResponse.redirect(loginUrl);
}
