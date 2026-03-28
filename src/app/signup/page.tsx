"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  User2,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

type FormState = { error?: string } | undefined;

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a letter", test: (p: string) => /[a-z]/i.test(p) },
  { label: "Contains a number", test: (p: string) => /[0-9]/.test(p) },
];

function strengthScore(pw: string): number {
  return RULES.filter((r) => r.test(pw)).length;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Strong"];
const STRENGTH_COLOR = ["", "#dc2626", "#d97706", "#16a34a"];

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pending, setPending] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`,
        );
        const data = await res.json();
        setUsernameStatus(
          data.available
            ? "available"
            : data.reason === "invalid"
              ? "invalid"
              : "taken",
        );
      } catch {
        setUsernameStatus("idle");
      }
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  const score = pw.length > 0 ? strengthScore(pw) : 0;

  const [state, formAction] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      if (!username || !password) return { error: "All fields are required" };
      if (!/^[a-z0-9_]{3,32}$/i.test(username))
        return {
          error:
            "Username must be 3–32 characters: letters, numbers, underscores",
        };
      if (password.length < 8)
        return { error: "Password must be at least 8 characters" };

      setPending(true);
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error ?? "Signup failed" };
        router.push("/dashboard");
        router.refresh();
        return undefined;
      } catch {
        return { error: "Network error. Please try again." };
      } finally {
        setPending(false);
      }
    },
    undefined,
  );

  return (
    <div
      className="min-h-screen flex items-stretch"
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
              Start Finding
              <br />
              Vulnerabilities
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Create your account and run your first security scan in minutes.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { step: "01", text: "Create your account" },
              { step: "02", text: "Configure a scan target" },
              { step: "03", text: "Choose attack types" },
              { step: "04", text: "Analyse results in real time" },
            ].map(({ step, text }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {step}
                </div>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {text}
                </p>
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
              Create an account
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Free to use · No credit card required
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
                  {/* Left icon — always the User2 */}
                  <User2
                    className="w-4 h-4 pointer-events-none"
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color:
                        usernameStatus === "available"
                          ? "#16a34a"
                          : usernameStatus === "taken" ||
                              usernameStatus === "invalid"
                            ? "#dc2626"
                            : "var(--primary-400)",
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: "100%",
                      paddingTop: "0.65rem",
                      paddingBottom: "0.65rem",
                      paddingLeft: "2.5rem",
                      paddingRight:
                        usernameStatus !== "idle" ? "2.5rem" : "1rem",
                      background: "var(--bg-secondary)",
                      border: `1.5px solid ${
                        usernameStatus === "available"
                          ? "#16a34a"
                          : usernameStatus === "taken" ||
                              usernameStatus === "invalid"
                            ? "#dc2626"
                            : "var(--border)"
                      }`,
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
                      e.target.style.borderColor =
                        usernameStatus === "available"
                          ? "#16a34a"
                          : usernameStatus === "taken" ||
                              usernameStatus === "invalid"
                            ? "#dc2626"
                            : "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {/* Right-side status icon */}
                  {usernameStatus === "checking" && (
                    <span
                      className="pointer-events-none"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className="animate-spin"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid var(--primary-400)",
                          borderTopColor: "transparent",
                          display: "inline-block",
                        }}
                      />
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <CheckCircle
                      className="w-4 h-4 pointer-events-none"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#16a34a",
                      }}
                    />
                  )}
                  {(usernameStatus === "taken" ||
                    usernameStatus === "invalid") && (
                    <XCircle
                      className="w-4 h-4 pointer-events-none"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#dc2626",
                      }}
                    />
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {usernameStatus === "available" && (
                    <motion.p
                      key="avail"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "#16a34a" }}
                    >
                      <CheckCircle className="w-3 h-3" /> Username is available
                    </motion.p>
                  )}
                  {usernameStatus === "taken" && (
                    <motion.p
                      key="taken"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "#dc2626" }}
                    >
                      <XCircle className="w-3 h-3" /> Username already taken
                    </motion.p>
                  )}
                  {usernameStatus === "invalid" && (
                    <motion.p
                      key="invalid"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "#dc2626" }}
                    >
                      <XCircle className="w-3 h-3" /> 3–32 characters · letters,
                      numbers, underscores
                    </motion.p>
                  )}
                  {(usernameStatus === "idle" ||
                    usernameStatus === "checking") && (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-1.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      3–32 characters · letters, numbers, underscores
                    </motion.p>
                  )}
                </AnimatePresence>
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
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
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

                {/* Strength bar + rules */}
                <AnimatePresence>
                  {pw.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      {/* Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background:
                                  score >= n
                                    ? STRENGTH_COLOR[score]
                                    : "var(--border)",
                              }}
                            />
                          ))}
                        </div>
                        <ShieldCheck
                          className="w-3.5 h-3.5"
                          style={{
                            color:
                              score > 0
                                ? STRENGTH_COLOR[score]
                                : "var(--text-muted)",
                          }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              score > 0
                                ? STRENGTH_COLOR[score]
                                : "var(--text-muted)",
                            minWidth: 36,
                          }}
                        >
                          {STRENGTH_LABEL[score]}
                        </span>
                      </div>

                      {/* Rules checklist */}
                      <ul className="space-y-1">
                        {RULES.map(({ label, test }) => {
                          const ok = test(pw);
                          return (
                            <li
                              key={label}
                              className="flex items-center gap-1.5 text-xs"
                              style={{
                                color: ok
                                  ? "var(--green)"
                                  : "var(--text-muted)",
                              }}
                            >
                              {ok ? (
                                <CheckCircle className="w-3 h-3 shrink-0" />
                              ) : (
                                <XCircle className="w-3 h-3 shrink-0" />
                              )}
                              {label}
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                      Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
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
                      {/* Circle loader ring */}
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
                        Creating your account…
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
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold"
              style={{ color: "var(--primary)" }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
