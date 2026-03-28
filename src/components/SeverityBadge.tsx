import type { Severity } from "@/types";

const CONFIG: Record<Severity, { label: string; cls: string }> = {
  critical: { label: "CRITICAL", cls: "severity-critical" },
  high: { label: "HIGH", cls: "severity-high" },
  medium: { label: "MEDIUM", cls: "severity-medium" },
  low: { label: "LOW", cls: "severity-low" },
  info: { label: "INFO", cls: "severity-info" },
};

interface Props {
  severity: Severity;
  size?: "sm" | "md";
}

export default function SeverityBadge({ severity, size = "sm" }: Props) {
  const { label, cls } = CONFIG[severity] ?? CONFIG.info;
  const px = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center rounded font-bold tracking-wide ${px} ${cls}`}
    >
      {label}
    </span>
  );
}
