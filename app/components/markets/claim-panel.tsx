"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type Address, type Lamports } from "@solana/kit";
import { useWallet } from "../../lib/wallet/context";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import { lamportsToSolString } from "../../lib/lamports";
import { parseTransactionError } from "../../lib/errors";
import { getOutcome } from "../../lib/market-view";
import { useCluster } from "../cluster-context";
import { ACCENT, GRAD_BTN, GLASS_CARD, GLASS_CARD_SHADOW } from "../../lib/theme";
import {
  getClaimWinningsInstructionAsync,
  type Market,
  type UserPosition,
} from "../../generated/prediction_market";

export function ClaimPanel({
  marketAddress,
  market,
  position,
  onSuccess,
}: {
  marketAddress: Address;
  market: Market;
  position: UserPosition | null;
  onSuccess: () => void;
}) {
  const { signer } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();
  const [claiming, setClaiming] = useState(false);

  // Only rendered once the market is resolved, so the on-chain program
  // guarantees `outcome` is populated.
  const outcome = getOutcome(market)!;
  const hasPosition =
    position != null && (position.yesAmount > 0n || position.noAmount > 0n);

  const handleClaim = useCallback(async () => {
    if (!signer) return;
    setClaiming(true);
    try {
      const instruction = await getClaimWinningsInstructionAsync({
        user: signer,
        market: marketAddress,
      });

      const signature = await send({ instructions: [instruction] });

      toast.success("Winnings claimed!", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${signature}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction
          </a>
        ),
      });
      onSuccess();
    } catch (err) {
      console.error("Claim winnings failed:", err);
      toast.error(parseTransactionError(err));
    } finally {
      setClaiming(false);
    }
  }, [signer, marketAddress, send, getExplorerUrl, onSuccess]);

  if (!hasPosition) {
    return (
      <div
        className="rounded-[22px] border p-[22px] text-center backdrop-blur-2xl"
        style={{ background: GLASS_CARD, borderColor: "rgba(255,255,255,0.85)", boxShadow: GLASS_CARD_SHADOW }}
      >
        <div className="mb-[5px] text-[15px] font-bold text-[#17171B]">
          Resolved {outcome ? "YES" : "NO"}
        </div>
        <p className="text-[13px] text-[#9A9AA3]">
          This market has settled. You didn&apos;t hold a position here.
        </p>
      </div>
    );
  }

  const win = outcome ? position!.yesAmount : position!.noAmount;
  const won = win > 0n;

  if (!won) {
    const lost = outcome ? position!.noAmount : position!.yesAmount;
    return (
      <div
        className="rounded-[22px] border p-[22px] text-center backdrop-blur-2xl"
        style={{ background: GLASS_CARD, borderColor: "rgba(255,255,255,0.85)", boxShadow: GLASS_CARD_SHADOW }}
      >
        <div className="mb-[5px] text-[15px] font-bold text-[#6E6E78]">
          Market resolved {outcome ? "YES" : "NO"}
        </div>
        <p className="text-[13px] leading-[1.5] text-[#9A9AA3]">
          You bet ◎ {lamportsToSolString(lost as Lamports)} on{" "}
          {outcome ? "NO" : "YES"}, the losing side. Nothing to claim this
          time.
        </p>
      </div>
    );
  }

  if (position!.claimed) {
    return (
      <div
        className="rounded-[22px] border p-[22px] text-center backdrop-blur-2xl"
        style={{ background: GLASS_CARD, borderColor: "rgba(255,255,255,0.85)", boxShadow: GLASS_CARD_SHADOW }}
      >
        <div className="mb-[5px] text-[15px] font-bold text-[#6E6E78]">
          &#10003; Claimed
        </div>
        <p className="text-[13px] text-[#9A9AA3]">
          You&apos;ve already claimed your winnings from this market.
        </p>
      </div>
    );
  }

  const winningPool = outcome ? market.yesPool : market.noPool;
  const losingPool = outcome ? market.noPool : market.yesPool;
  const winnings = winningPool > 0n ? (win * losingPool) / winningPool : 0n;
  const payout = win + winnings;

  return (
    <div
      className="rounded-[22px] border p-[22px] backdrop-blur-2xl"
      style={{
        background:
          "linear-gradient(157deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.62) 100%)",
        borderColor: "rgba(255,255,255,0.85)",
        boxShadow: "0 24px 56px -30px rgba(66,56,120,0.42), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <div className="mb-1 text-[15px] font-bold text-[#17171B]">
        You won &#127881;
      </div>
      <p className="mb-4 text-[12.5px] text-[#6E6E78]">
        You backed {outcome ? "YES" : "NO"} &mdash; the winning side. Here&apos;s
        the breakdown:
      </p>
      <div className="mb-4 space-y-2 rounded-xl bg-[#F7F6F3] px-4 py-[15px] font-mono text-[13px]">
        <div className="flex justify-between">
          <span className="text-[#6E6E78]">Your bet</span>
          <span className="font-semibold text-[#17171B]">
            ◎ {lamportsToSolString(win as Lamports)}
          </span>
        </div>
        <div className="mb-1 flex justify-between">
          <span className="text-[#6E6E78]">Winnings from losing pool</span>
          <span className="font-semibold" style={{ color: ACCENT }}>
            + ◎ {lamportsToSolString(winnings as Lamports)}
          </span>
        </div>
        <div
          className="flex justify-between border-t pt-2.5 text-[15px]"
          style={{ borderColor: "rgba(23,23,27,0.1)" }}
        >
          <span className="font-semibold text-[#17171B]">Total payout</span>
          <span className="font-bold text-[#17171B]">
            ◎ {lamportsToSolString(payout as Lamports)}
          </span>
        </div>
      </div>
      <button
        onClick={handleClaim}
        disabled={isSending || claiming}
        className="hover-btn-gradient-sm h-[50px] w-full rounded-xl text-[15px] font-bold text-white disabled:opacity-50"
        style={{ background: GRAD_BTN, boxShadow: "0 10px 24px -12px rgba(79,70,229,0.7)" }}
      >
        {claiming
          ? "Confirming..."
          : `Claim ◎ ${lamportsToSolString(payout as Lamports)}`}
      </button>
    </div>
  );
}
