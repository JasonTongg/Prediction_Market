import type { MarketStatus } from "../../lib/market-view";
import { YES, NO } from "../../lib/theme";

export function StatusBadge({
  status,
  outcome,
  size = "sm",
}: {
  status: MarketStatus;
  outcome?: boolean | null;
  size?: "sm" | "lg";
}) {
  const height = size === "lg" ? 26 : 24;
  const paddingX = size === "lg" ? 10 : 9;
  const fontSize = size === "lg" ? "12px" : "11.5px";

  let dot: string;
  let text: string;
  let bg: string;
  let border: string;
  let label: string;
  let pulse = false;

  if (status === "open") {
    dot = YES;
    text = "#0A7A54";
    bg = "rgba(14,159,110,0.10)";
    border = "rgba(14,159,110,0.28)";
    label = "Open";
    pulse = true;
  } else if (status === "awaiting") {
    dot = "#B7791F";
    text = "#8A5A12";
    bg = "rgba(183,121,31,0.12)";
    border = "rgba(183,121,31,0.32)";
    label = "Awaiting resolution";
  } else {
    dot = outcome ? YES : NO;
    text = "#17171B";
    bg = "#F1F1EF";
    border = "rgba(23,23,27,0.12)";
    label = `Resolved · ${outcome ? "YES" : "NO"}`;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg font-semibold"
      style={{
        height,
        padding: `0 ${paddingX}px`,
        fontSize,
        background: bg,
        color: text,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: dot, animation: pulse ? "vpulse 2s infinite" : undefined }}
      />
      {label}
    </span>
  );
}
