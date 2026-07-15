"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type Address } from "@solana/kit";
import { useWallet } from "../../lib/wallet/context";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import { lamportsFromSol } from "../../lib/lamports";
import { parseTransactionError } from "../../lib/errors";
import { useCluster } from "../cluster-context";
import { GRAD_BTN, GLASS_CARD, GLASS_CARD_SHADOW } from "../../lib/theme";
import { getPlaceBetInstructionAsync } from "../../generated/prediction_market";

const QUICK_AMOUNTS = [0.5, 1, 5, 10];

export function BetPanel({
  marketAddress,
  onSuccess,
}: {
  marketAddress: Address;
  onSuccess: () => void;
}) {
  const { signer } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();

  const [betYes, setBetYes] = useState(true);
  const [amount, setAmount] = useState("");

  const amountNum = parseFloat(amount);
  const ready = !isSending && amountNum > 0;

  const handleBet = useCallback(async () => {
    if (!signer || !(amountNum > 0)) return;

    try {
      const instruction = await getPlaceBetInstructionAsync({
        user: signer,
        market: marketAddress,
        amount: lamportsFromSol(amountNum),
        betYes,
      });

      const signature = await send({ instructions: [instruction] });

      toast.success(`Bet placed · ◎ ${amountNum} on ${betYes ? "YES" : "NO"}`, {
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
      setAmount("");
      onSuccess();
    } catch (err) {
      console.error("Place bet failed:", err);
      toast.error(parseTransactionError(err));
    }
  }, [signer, marketAddress, amountNum, betYes, send, getExplorerUrl, onSuccess]);

  return (
    <div
      className="rounded-[22px] border p-[22px] backdrop-blur-2xl"
      style={{
        background: GLASS_CARD,
        borderColor: "rgba(255,255,255,0.85)",
        boxShadow: GLASS_CARD_SHADOW,
      }}
    >
      <div className="mb-[15px] text-[15px] font-bold text-[#17171B]">
        Place a bet
      </div>

      <div className="mb-[15px] grid grid-cols-2 gap-[9px]">
        <button
          onClick={() => setBetYes(true)}
          disabled={isSending}
          className="hover-yes-tab h-12 rounded-[11px] border text-[15px] font-bold disabled:opacity-50"
          style={
            betYes
              ? { background: "#0E9F6E", color: "#fff", borderColor: "#0E9F6E" }
              : { background: "#fff", color: "#0A7A54", borderColor: "rgba(14,159,110,0.35)" }
          }
        >
          YES
        </button>
        <button
          onClick={() => setBetYes(false)}
          disabled={isSending}
          className="hover-no-tab h-12 rounded-[11px] border text-[15px] font-bold disabled:opacity-50"
          style={
            !betYes
              ? { background: "#E5556A", color: "#fff", borderColor: "#E5556A" }
              : { background: "#fff", color: "#C23A4E", borderColor: "rgba(229,85,106,0.35)" }
          }
        >
          NO
        </button>
      </div>

      <div className="relative mb-[11px]">
        <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 font-mono text-[17px] text-[#9A9AA3]">
          ◎
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSending}
          placeholder="0.00"
          className="focus-accent h-[52px] w-full rounded-xl border pl-10 pr-[15px] font-mono text-[19px] font-semibold text-[#17171B] outline-none disabled:opacity-50"
          style={{ borderColor: "rgba(23,23,27,0.16)" }}
        />
      </div>

      <div className="mb-4 flex gap-[7px]">
        {QUICK_AMOUNTS.map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            disabled={isSending}
            className="hover-quick-chip h-[34px] flex-1 rounded-[10px] border font-mono text-xs font-semibold text-[#3E3E46] backdrop-blur-sm disabled:opacity-50"
            style={{ borderColor: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.55)" }}
          >
            ◎ {v}
          </button>
        ))}
      </div>

      <button
        onClick={handleBet}
        disabled={!ready}
        className="hover-btn-gradient h-[52px] w-full rounded-[14px] text-[15px] font-bold"
        style={{
          background: ready ? GRAD_BTN : "#DDDDE1",
          color: ready ? "#fff" : "#9A9AA3",
          boxShadow: "0 14px 28px -14px rgba(79,70,229,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {isSending
          ? "Confirming..."
          : amountNum > 0
            ? `Bet ◎ ${amountNum} on ${betYes ? "YES" : "NO"}`
            : "Enter an amount"}
      </button>

      <p className="mt-3 text-[11.5px] leading-[1.5] text-[#9A9AA3]">
        Payouts are drawn from the losing pool proportional to your stake. You
        can bet both sides.
      </p>
    </div>
  );
}
