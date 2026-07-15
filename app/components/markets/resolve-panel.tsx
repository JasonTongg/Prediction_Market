"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type Address } from "@solana/kit";
import { useWallet } from "../../lib/wallet/context";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import { parseTransactionError } from "../../lib/errors";
import { useCluster } from "../cluster-context";
import { getResolveMarketInstruction } from "../../generated/prediction_market";

export function ResolvePanel({
  marketAddress,
  isCreator,
  onSuccess,
}: {
  marketAddress: Address;
  isCreator: boolean;
  onSuccess: () => void;
}) {
  const { signer } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();
  const [pending, setPending] = useState<"yes" | "no" | null>(null);

  const resolve = useCallback(
    async (outcome: boolean) => {
      if (!signer) return;
      setPending(outcome ? "yes" : "no");
      try {
        const instruction = getResolveMarketInstruction({
          creator: signer,
          market: marketAddress,
          outcome,
        });

        const signature = await send({ instructions: [instruction] });

        toast.success(`Market resolved · ${outcome ? "YES" : "NO"} wins`, {
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
        console.error("Resolve market failed:", err);
        toast.error(parseTransactionError(err));
      } finally {
        setPending(null);
      }
    },
    [signer, marketAddress, send, getExplorerUrl, onSuccess]
  );

  if (!isCreator) {
    return (
      <div
        className="rounded-[18px] border p-[22px] text-center"
        style={{ background: "rgba(183,121,31,0.07)", borderColor: "rgba(183,121,31,0.25)" }}
      >
        <div
          className="mx-auto mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-full text-[17px]"
          style={{ background: "rgba(183,121,31,0.14)" }}
        >
          &#8987;
        </div>
        <div className="mb-[5px] text-[15px] font-bold text-[#8A5A12]">
          Waiting on the creator
        </div>
        <p className="text-[12.5px] leading-[1.5] text-[#8A5A12]/85">
          Betting has closed. Only the market&apos;s creator can resolve the
          outcome. Check back once it&apos;s settled.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[18px] border bg-white p-[22px]"
      style={{ borderColor: "rgba(183,121,31,0.35)" }}
    >
      <div className="mb-1.5 flex items-center gap-2 text-[15px] font-bold text-[#17171B]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#B7791F]" />
        Resolve this market
      </div>
      <p className="mb-4 text-[12.5px] leading-[1.5] text-[#6E6E78]">
        The deadline has passed. As the creator, you decide the outcome.{" "}
        <strong className="text-[#8A5A12]">
          This is permanent and cannot be undone.
        </strong>
      </p>
      <div className="grid grid-cols-2 gap-[9px]">
        <button
          onClick={() => resolve(true)}
          disabled={isSending}
          className="hover-settle-yes h-[50px] rounded-xl border text-[15px] font-bold text-[#0A7A54] disabled:opacity-50"
          style={{ borderColor: "rgba(14,159,110,0.4)", background: "rgba(14,159,110,0.07)" }}
        >
          {pending === "yes" ? "Confirming..." : "Settle YES"}
        </button>
        <button
          onClick={() => resolve(false)}
          disabled={isSending}
          className="hover-settle-no h-[50px] rounded-xl border text-[15px] font-bold text-[#C23A4E] disabled:opacity-50"
          style={{ borderColor: "rgba(229,85,106,0.4)", background: "rgba(229,85,106,0.07)" }}
        >
          {pending === "no" ? "Confirming..." : "Settle NO"}
        </button>
      </div>
    </div>
  );
}
