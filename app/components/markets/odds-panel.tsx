import { type Lamports } from "@solana/kit";
import type { Market } from "../../generated/prediction_market";
import {
  formatCountdown,
  formatDate,
  getMarketStatus,
  getOdds,
  getOutcome,
} from "../../lib/market-view";
import { lamportsToSolString } from "../../lib/lamports";
import { GLASS_CARD, GLASS_CARD_SHADOW } from "../../lib/theme";
import { OddsBar } from "./odds-bar";

export function OddsPanel({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, now);
  const odds = getOdds(market);
  const outcome = getOutcome(market);
  const resolutionMs = Number(market.resolutionTime) * 1000;

  const timePre =
    status === "open"
      ? "closes in"
      : status === "awaiting"
        ? "deadline passed"
        : "resolved";
  const timeLabel =
    status === "open"
      ? formatCountdown(resolutionMs - now)
      : status === "awaiting"
        ? `${formatCountdown(now - resolutionMs)} ago`
        : formatDate(resolutionMs);
  const timeColor =
    (status === "open" && resolutionMs - now < 3_600_000) || status === "awaiting"
      ? "#8A5A12"
      : "#3E3E46";

  return (
    <div
      className="rounded-[22px] border p-6 backdrop-blur-2xl"
      style={{
        background: GLASS_CARD,
        borderColor: "rgba(255,255,255,0.85)",
        boxShadow: GLASS_CARD_SHADOW,
      }}
    >
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-[9px]">
          <span className="text-[11px] uppercase tracking-[0.05em] text-[#9A9AA3]">
            {timePre}
          </span>
          <span
            className="font-mono text-base font-semibold"
            style={{ color: timeColor }}
          >
            {timeLabel}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.05em] text-[#9A9AA3]">
            total pool
          </div>
          <div className="font-mono text-base font-semibold text-[#17171B]">
            ◎ {lamportsToSolString((market.yesPool + market.noPool) as Lamports)}
          </div>
        </div>
      </div>

      <div
        className="mb-[14px] flex items-end justify-between gap-4 rounded-[14px] px-[18px] py-4"
        style={{
          background:
            "linear-gradient(90deg,rgba(14,159,110,0.10),rgba(14,159,110,0) 42%,rgba(229,85,106,0) 58%,rgba(229,85,106,0.10))",
        }}
      >
        <div>
          <div className="font-mono text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#0E9F6E]">
            {odds.yesPct}
            <span className="text-[22px]">%</span>
          </div>
          <div className="mt-1.5 text-[13px] font-bold tracking-[0.02em] text-[#0E9F6E]">
            YES &middot; ◎ {lamportsToSolString(market.yesPool as Lamports)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#E5556A]">
            {odds.noPct}
            <span className="text-[22px]">%</span>
          </div>
          <div className="mt-1.5 text-[13px] font-bold tracking-[0.02em] text-[#E5556A]">
            NO &middot; ◎ {lamportsToSolString(market.noPool as Lamports)}
          </div>
        </div>
      </div>

      <OddsBar
        status={status}
        outcome={outcome}
        yesPct={odds.yesPct}
        noPct={odds.noPct}
        noBets={odds.noBets}
        lead={odds.lead}
        size="lg"
      />

      <p className="mt-[13px] text-[12.5px] text-[#9A9AA3]">
        {odds.noBets
          ? "No bets placed yet — odds open at 50 / 50."
          : `Implied probability: YES ${odds.yesPct}% · NO ${odds.noPct}%. Odds shift with every bet.`}
      </p>
    </div>
  );
}
