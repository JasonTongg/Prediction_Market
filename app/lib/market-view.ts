import { unwrapOption } from "@solana/kit";
import type { Market } from "../generated/prediction_market";

export type MarketStatus = "open" | "awaiting" | "resolved";

export function getMarketStatus(market: Market, now: number): MarketStatus {
  if (market.resolved) return "resolved";
  if (now >= Number(market.resolutionTime) * 1000) return "awaiting";
  return "open";
}

export function getOutcome(market: Market): boolean | null {
  return unwrapOption(market.outcome);
}

export function getOdds(market: Market) {
  const yes = Number(market.yesPool);
  const no = Number(market.noPool);
  const total = yes + no;
  const noBets = total <= 0;
  const yesPct = noBets ? 50 : Math.round((yes / total) * 100);
  const noPct = 100 - yesPct;
  const lead: "YES" | "NO" | "even" =
    yes > no ? "YES" : no > yes ? "NO" : "even";
  return { yes, no, total, noBets, yesPct, noPct, lead };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const YES = "#0E9F6E";
const NO = "#E5556A";
const YES_LIGHT = "#A7E0CC";
const NO_LIGHT = "#F4B8C1";
const MUTED_SEG = "#D6D6DC";
const RESOLVED_LOSER_SEG = "#E4E1E6";
const MUTED_TEXT = "#6E6E78";
const RESOLVED_LOSER_TEXT = "#A6A6AF";

/**
 * Matches the source design's seg()/pc() helpers: while open/awaiting, the
 * bar segment (not the text label) dims for the trailing side; once
 * resolved, the losing side dims for both segment and label.
 */
export function getOddsColors(
  status: MarketStatus,
  outcome: boolean | null,
  noBets: boolean,
  lead: "YES" | "NO" | "even"
) {
  const seg = (side: "YES" | "NO") => {
    if (noBets) return MUTED_SEG;
    if (status === "resolved") return side === (outcome ? "YES" : "NO") ? (side === "YES" ? YES : NO) : RESOLVED_LOSER_SEG;
    return side === lead ? (side === "YES" ? YES : NO) : side === "YES" ? YES_LIGHT : NO_LIGHT;
  };
  const text = (side: "YES" | "NO") => {
    if (noBets) return MUTED_TEXT;
    if (status === "resolved") return side === (outcome ? "YES" : "NO") ? (side === "YES" ? YES : NO) : RESOLVED_LOSER_TEXT;
    return side === "YES" ? YES : NO;
  };
  return {
    yesBar: seg("YES"),
    noBar: seg("NO"),
    yesText: text("YES"),
    noText: text("NO"),
  };
}
