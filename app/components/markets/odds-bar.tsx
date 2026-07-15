import { getOddsColors, type MarketStatus } from "../../lib/market-view";

export function OddsBar({
  status,
  outcome,
  yesPct,
  noPct,
  noBets,
  lead,
  size = "sm",
}: {
  status: MarketStatus;
  outcome: boolean | null;
  yesPct: number;
  noPct: number;
  noBets: boolean;
  lead: "YES" | "NO" | "even";
  size?: "sm" | "lg";
}) {
  const colors = getOddsColors(status, outcome, noBets, lead);
  const isLg = size === "lg";
  const barHeight = isLg ? 12 : 7;
  const barRadius = isLg ? 6 : 4;
  const labelSize = isLg ? "13px" : "12.5px";

  return (
    <div>
      <div
        className="mb-[7px] flex items-baseline justify-between font-mono font-semibold"
        style={{ fontSize: labelSize }}
      >
        <span style={{ color: colors.yesText }}>YES {yesPct}%</span>
        <span style={{ color: colors.noText }}>{noPct}% NO</span>
      </div>
      <div
        className="flex overflow-hidden"
        style={{
          height: barHeight,
          borderRadius: barRadius,
          background: "#EDECE9",
          gap: isLg ? 2 : 0,
        }}
      >
        <div
          style={{
            width: `${yesPct}%`,
            background: colors.yesBar,
            borderRadius: isLg ? "6px 2px 2px 6px" : undefined,
          }}
        />
        <div
          style={{
            width: `${noPct}%`,
            background: colors.noBar,
            borderRadius: isLg ? "2px 6px 6px 2px" : undefined,
          }}
        />
      </div>
    </div>
  );
}
