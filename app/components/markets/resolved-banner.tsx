import { formatDate } from "../../lib/market-view";
import { YESPastle, NO, GRAD_HERO } from "../../lib/theme";

export function ResolvedBanner({
  outcome,
  resolutionTime,
}: {
  outcome: boolean;
  resolutionTime: bigint;
}) {
  return (
    <div
      className="relative mt-4 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border px-[22px] py-5"
      style={{
        background: GRAD_HERO,
        borderColor: "rgba(255,255,255,0.5)",
        boxShadow: "0 20px 46px -26px rgba(124,58,237,0.34)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(680px 260px at 88% -34%, rgba(255,255,255,0.55), transparent 62%)",
        }}
      />
      <div className="relative">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#17171B]">
          Final verdict
        </div>
        <div className="mt-0.5 text-[26px] font-bold tracking-[-0.02em]">
          <span style={{ color: outcome ? YESPastle : NO }}>
            {outcome ? "YES" : "NO"}
          </span>{" "}
          <span className="text-[18px] font-bold text-[#17171B]">won</span>
        </div>
      </div>
      <div className="relative text-right font-mono text-xs font-semibold text-[#17171B]">
        <div>deadline was {formatDate(Number(resolutionTime) * 1000)}</div>
        <div className="mt-0.5">outcome is permanent</div>
      </div>
    </div>
  );
}
