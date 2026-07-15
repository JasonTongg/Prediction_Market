import Link from "next/link";
import { type Address, type Lamports } from "@solana/kit";
import type { Market } from "../../generated/prediction_market";
import {
  formatCountdown,
  formatDate,
  getMarketStatus,
  getOdds,
  getOutcome,
} from "../../lib/market-view";
import { lamportsToSolString } from "../../lib/lamports";
import { ACCENT } from "../../lib/theme";
import { StatusBadge } from "./status-badge";
import { OddsBar } from "./odds-bar";

export function MarketTile({
  address,
  market,
  now,
  walletAddress,
}: {
  address: Address;
  market: Market;
  now: number;
  walletAddress?: Address;
}) {
  const status = getMarketStatus(market, now);
  const odds = getOdds(market);
  const outcome = getOutcome(market);
  const resolutionMs = Number(market.resolutionTime) * 1000;
  const mine = walletAddress != null && market.creator === walletAddress;

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

  return (
    <Link
      href={`/market/${address}`}
      className="hover-card flex animate-[vfade_0.3s_ease] flex-col gap-3.5 rounded-[22px] border p-5 pb-[18px] text-left backdrop-blur-2xl [background:linear-gradient(157deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.58)_100%)] [border-color:rgba(255,255,255,0.8)] [box-shadow:0_20px_48px_-30px_rgba(66,56,120,0.4),inset_0_1px_0_rgba(255,255,255,0.9)]"
    >
      <div className="flex items-center justify-between gap-2.5">
        <StatusBadge status={status} outcome={outcome} />
        {mine && (
          <span
            className="rounded-[5px] px-[7px] py-0.5 text-[10.5px] font-semibold"
            style={{ color: ACCENT, background: "rgba(58,86,232,0.09)" }}
          >
            yours
          </span>
        )}
      </div>

      <p className="line-clamp-2 min-h-[42px] text-base font-semibold leading-[1.32] tracking-[-0.01em] text-[#17171B]">
        {market.question}
      </p>

      <OddsBar
        status={status}
        outcome={outcome}
        yesPct={odds.yesPct}
        noPct={odds.noPct}
        noBets={odds.noBets}
        lead={odds.lead}
      />

      <div
        className="flex items-center justify-between gap-2.5 border-t pt-3"
        style={{ borderColor: "rgba(23,23,27,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-semibold text-[#17171B]">
            ◎ {lamportsToSolString(BigInt(odds.total) as Lamports)}
          </span>
          <span className="text-[11.5px] text-[#9A9AA3]">pool</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.04em] text-[#9A9AA3]">
            {timePre}
          </div>
          <div className="font-mono text-[12.5px] font-medium text-[#3E3E46]">
            {timeLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}
