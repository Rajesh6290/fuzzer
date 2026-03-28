import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import Sidebar from "@/components/Sidebar";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  // No session cookie at all → go to login
  if (!session) redirect("/login");

  // JWT is valid but user may have been deleted from DB
  await connectDB();
  const userExists = await User.exists({ _id: session.userId });
  if (!userExists) {
    // Can't delete cookies from a Server Component — redirect to the
    // session-expired route handler which clears the cookie then redirects
    redirect("/api/auth/session-expired");
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
