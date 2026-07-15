import { type Lamports } from "@solana/kit";
import type { UserPosition } from "../../generated/prediction_market";
import type { MarketStatus } from "../../lib/market-view";
import { lamportsToSolString } from "../../lib/lamports";
import { ACCENT, GLASS_CARD, GLASS_CARD_SHADOW } from "../../lib/theme";

export function PositionPanel({
  position,
  status,
  outcome,
}: {
  position: UserPosition;
  status: MarketStatus;
  outcome: boolean | null;
}) {
  const won =
    status === "resolved" &&
    ((outcome === true && position.yesAmount > 0n) ||
      (outcome === false && position.noAmount > 0n));

  let tag: string;
  let tagBg = "#F1F1EF";
  let tagColor = "#6E6E78";
  if (status === "resolved") {
    if (won) {
      tag = "On the winning side";
      tagBg = "rgba(58,86,232,0.10)";
      tagColor = ACCENT;
    } else {
      tag = "On the losing side";
    }
  } else {
    const myLead =
      position.yesAmount > position.noAmount
        ? "YES"
        : position.noAmount > position.yesAmount
          ? "NO"
          : "even";
    tag = myLead === "even" ? "In play" : `Leaning ${myLead}`;
  }

  return (
    <div
      className="rounded-[20px] border px-[22px] py-5 backdrop-blur-2xl"
      style={{
        background: GLASS_CARD,
        borderColor: "rgba(255,255,255,0.85)",
        boxShadow: GLASS_CARD_SHADOW,
      }}
    >
      <div className="mb-[14px] text-xs uppercase tracking-[0.05em] text-[#9A9AA3]">
        Your position
      </div>
      <div className="flex flex-wrap items-center gap-[26px]">
        <div>
          <div className="mb-[3px] text-xs text-[#6E6E78]">On YES</div>
          <div className="font-mono text-xl font-semibold text-[#17171B]">
            ◎ {lamportsToSolString(position.yesAmount as Lamports)}
          </div>
        </div>
        <div className="h-8 w-px" style={{ background: "rgba(23,23,27,0.08)" }} />
        <div>
          <div className="mb-[3px] text-xs text-[#6E6E78]">On NO</div>
          <div className="font-mono text-xl font-semibold text-[#17171B]">
            ◎ {lamportsToSolString(position.noAmount as Lamports)}
          </div>
        </div>
        <div className="ml-auto flex min-w-[150px] items-center justify-end">
          <span
            className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold"
            style={{ background: tagBg, color: tagColor }}
          >
            {tag}
          </span>
        </div>
      </div>
      {position.claimed && (
        <p className="mt-2.5 text-xs text-[#9A9AA3]">Winnings claimed.</p>
      )}
    </div>
  );
}
