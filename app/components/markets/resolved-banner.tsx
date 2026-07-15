import { formatDate } from "../../lib/market-view";
import { YES_DARK_BG, NO_DARK_BG } from "../../lib/theme";

export function ResolvedBanner({
  outcome,
  resolutionTime,
}: {
  outcome: boolean;
  resolutionTime: bigint;
}) {
  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-[22px] py-5 text-white"
      style={{
        background: "linear-gradient(120deg,#1c1233 0%,#0f172a 55%,#0a2a22 100%)",
        boxShadow: "0 18px 40px -22px rgba(15,23,42,0.8)",
      }}
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.06em] text-white/50">
          Final verdict
        </div>
        <div className="mt-0.5 text-[26px] font-bold tracking-[-0.02em]">
          <span style={{ color: outcome ? YES_DARK_BG : NO_DARK_BG }}>
            {outcome ? "YES" : "NO"}
          </span>{" "}
          <span className="text-[18px] font-medium text-white/45">won</span>
        </div>
      </div>
      <div className="text-right font-mono text-xs text-white/60">
        <div>deadline was {formatDate(Number(resolutionTime) * 1000)}</div>
        <div className="mt-0.5">outcome is permanent</div>
      </div>
    </div>
  );
}
