"use client";

import { useState, useActionState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  User2,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Zap,
  Bug,
  Activity,
} from "lucide-react";

type FormState = { error?: string } | undefined;

const FEATURES = [
  {
    icon: Bug,
    label: "11 Attack Types",
    sub: "SQLi, XSS, SSRF, XXE, SSTI & more",
  },
  {
    icon: Zap,
    label: "Concurrent Fuzzing",
    sub: "5× parallel requests with mutation",
  },
  {
    icon: Activity,
    label: "Real-time Results",
    sub: "Live logs & severity breakdown",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Validate the redirect target is a relative path to prevent open-redirect attacks
  const rawFrom = searchParams.get("from") ?? "";
  const from =
    rawFrom.startsWith("/") && !rawFrom.startsWith("//")
      ? rawFrom
      : "/dashboard";
  const sessionExpired = searchParams.get("reason") === "session_expired";

  const [showPw, setShowPw] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      if (!username || !password) {
        return { error: "Username and password are required" };
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.error ?? "Login failed" };

        router.push(from);
        router.refresh();
        return undefined;
      } catch {
        return { error: "Network error. Please try again." };
      }
    },
    undefined,
  );

  return (
    <div
      className="min-h-dvh flex items-stretch"
      style={{
        background:
          "linear-gradient(135deg, #f0f0ff 0%, #f8f8ff 50%, #eef2ff 100%)",
      }}
    >
      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #6160b0 0%, #48488b 60%, #2d2c60 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.07) 0%, transparent 40%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3"
        >
          <Image
            src="/logo.svg"
            alt="FuzzX"
            width={120}
            height={40}
            className="brightness-0 invert"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Web Security
              <br />
              Fuzzing Platform
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Find vulnerabilities before attackers do. Automated payload
              testing with real-time analysis.
            </p>
          </div>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, sub }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p
          className="relative text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          © {new Date().getFullYear()} FuzzX · Security Testing Platform
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden mb-8">
            <Image src="/logo.svg" alt="FuzzX" width={100} height={34} />
          </div>

          <div className="mb-8">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "#ffffff",
              border: "1px solid var(--border)",
              boxShadow:
                "0 8px 40px rgba(97,96,176,0.12), 0 1px 4px rgba(97,96,176,0.06)",
            }}
          >
            <form action={formAction} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <User2
                    className="w-4 h-4 pointer-events-none"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--primary-400)",
                    }}
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    required
                    placeholder="your username"
                    style={{
                      width: "100%",
                      paddingTop: "0.65rem",
                      paddingBottom: "0.65rem",
                      paddingLeft: "2.5rem",
                      paddingRight: "1rem",
                      background: "var(--bg-secondary)",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                      outline: "none",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary-400)";
                      e.target.style.boxShadow = "0 0 0 3px var(--primary-100)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    className="w-4 h-4 pointer-events-none"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--primary-400)",
                    }}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      paddingTop: "0.65rem",
                      paddingBottom: "0.65rem",
                      paddingLeft: "2.5rem",
                      paddingRight: "2.75rem",
                      background: "var(--bg-secondary)",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                      outline: "none",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--primary-400)";
                      e.target.style.boxShadow = "0 0 0 3px var(--primary-100)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Session expired notice */}
              {sessionExpired && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "rgba(217,119,6,0.07)",
                    color: "#b45309",
                    border: "1px solid rgba(217,119,6,0.22)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Your session has expired. Please sign in again.
                </motion.div>
              )}

              {/* Error */}
              {state?.error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "rgba(220,38,38,0.06)",
                    color: "var(--danger)",
                    border: "1px solid rgba(220,38,38,0.18)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {state.error}
                </motion.div>
              )}

              {/* Submit */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: pending
                      ? "var(--primary-400)"
                      : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                    boxShadow: pending
                      ? "none"
                      : "0 4px 16px rgba(97,96,176,0.35)",
                    cursor: pending ? "not-allowed" : "pointer",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                >
                  {pending ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>

                {/* Below-button loader */}
                <AnimatePresence>
                  {pending && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="relative w-8 h-8">
                        <svg
                          className="w-8 h-8 -rotate-90"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="var(--primary-100)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="var(--primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="75.4"
                            strokeDashoffset="56.5"
                            className="animate-spin origin-center"
                            style={{ animationDuration: "1s" }}
                          />
                        </svg>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Signing you in…
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-muted)" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
