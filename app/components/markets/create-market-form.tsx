"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "../../lib/wallet/context";
import { useSendTransaction } from "../../lib/hooks/use-send-transaction";
import { useNow } from "../../lib/hooks/use-now";
import { parseTransactionError } from "../../lib/errors";
import { useCluster } from "../cluster-context";
import { GRAD_BTN } from "../../lib/theme";
import {
  findMarketPda,
  getCreateMarketInstructionAsync,
} from "../../generated/prediction_market";

const MAX_QUESTION_LEN = 200;

const DURATIONS: { label: string; hours: number }[] = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "3d", hours: 72 },
  { label: "7d", hours: 168 },
];

function chipStyle(active: boolean): React.CSSProperties {
  return active
    ? { background: GRAD_BTN, color: "#fff", borderColor: "transparent" }
    : { background: "#fff", color: "#3E3E46", borderColor: "rgba(23,23,27,0.12)" };
}

export function CreateMarketForm() {
  const router = useRouter();
  const { signer, connectors, connect, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();

  const [question, setQuestion] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const now = useNow(60_000);

  const trimmed = question.trim();
  const over = question.length > MAX_QUESTION_LEN;
  const connected = status === "connected";
  const ready = connected && trimmed.length > 0 && !over;

  const resolveDate = useMemo(
    () => new Date(now + durationHours * 3_600_000),
    [now, durationHours]
  );

  const counterColor = over ? "#C0392B" : question.length > 170 ? "#B7791F" : "#9A9AA3";

  const handleCreate = useCallback(async () => {
    if (!connected) {
      if (connectors.length > 0) void connect(connectors[0].id);
      return;
    }
    if (!signer || !trimmed || over || isSending) return;

    const marketId = BigInt(Date.now());
    const resolutionTime = BigInt(
      Math.floor((Date.now() + durationHours * 3_600_000) / 1000)
    );

    try {
      const instruction = await getCreateMarketInstructionAsync({
        creator: signer,
        marketId,
        question: trimmed,
        resolutionTime,
      });

      const signature = await send({ instructions: [instruction] });

      const [marketAddress] = await findMarketPda({
        creator: signer.address,
        marketId,
      });

      toast.success("Market created!", {
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

      router.push(`/market/${marketAddress}`);
    } catch (err) {
      console.error("Create market failed:", err);
      toast.error(parseTransactionError(err));
    }
  }, [
    connected,
    connectors,
    connect,
    signer,
    trimmed,
    over,
    isSending,
    durationHours,
    send,
    getExplorerUrl,
    router,
  ]);

  return (
    <div className="mx-auto max-w-[620px]">
      <h1 className="mb-2 text-[29px] font-bold tracking-[-0.03em] text-[#17171B]">
        Open a market
      </h1>
      <p className="mb-6 text-sm leading-[1.5] text-[#6E6E78]">
        Ask a yes-or-no question with a clear resolution deadline. Once
        created, nothing about it can be changed &mdash; and you&apos;ll be
        the only wallet that can resolve it.
      </p>

      <div
        className="flex flex-col gap-[22px] rounded-[22px] border p-[26px] backdrop-blur-2xl"
        style={{
          background:
            "linear-gradient(157deg,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0.62) 100%)",
          borderColor: "rgba(255,255,255,0.85)",
          boxShadow:
            "0 24px 56px -30px rgba(66,56,120,0.42), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div>
          <div className="mb-[9px] flex items-baseline justify-between">
            <label className="text-[13px] font-semibold text-[#17171B]">
              Question
            </label>
            <span
              className="font-mono text-[11.5px] font-medium"
              style={{ color: counterColor }}
            >
              {question.length} / {MAX_QUESTION_LEN}
            </span>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="Will&hellip;?"
            disabled={isSending}
            className="focus-accent w-full rounded-xl border px-[15px] py-[13px] text-[15px] leading-[1.4] text-[#17171B] outline-none disabled:opacity-50"
            style={{ borderColor: over ? "#C0392B" : "rgba(23,23,27,0.16)" }}
          />
          {over && (
            <p className="mt-[7px] text-xs text-[#C0392B]">
              Question must be {MAX_QUESTION_LEN} characters or fewer.
            </p>
          )}
          <p className="mt-2 text-[11.5px] text-[#9A9AA3]">
            Phrase it so a stranger could verify the answer at the deadline
            without asking you.
          </p>
        </div>

        <div>
          <label className="mb-[9px] block text-[13px] font-semibold text-[#17171B]">
            Resolution deadline
          </label>
          <div className="mb-[11px] flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                onClick={() => setDurationHours(d.hours)}
                disabled={isSending}
                className="hover-chip h-9 rounded-[9px] border px-4 font-mono text-[13px] font-semibold disabled:opacity-50"
                style={chipStyle(durationHours === d.hours)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-[10px] bg-[#F7F6F3] px-3.5 py-[11px] text-[13px] text-[#6E6E78]">
            <span className="text-[#9A9AA3]">&#8987;</span> Betting closes{" "}
            <strong className="font-mono font-semibold text-[#17171B]">
              {resolveDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </strong>
          </div>
        </div>

        <div
          className="flex gap-[11px] rounded-xl border px-4 py-3.5"
          style={{ background: "rgba(183,121,31,0.07)", borderColor: "rgba(183,121,31,0.22)" }}
        >
          <span className="text-[15px] leading-[1.2]">&#9888;</span>
          <p className="text-[12.5px] leading-[1.5] text-[#8A5A12]">
            Markets are immutable once created. The question and deadline are
            written to a PDA on-chain and can never be edited. You alone can
            resolve it, and only after the deadline.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="hover-btn-gradient h-[54px] rounded-[14px] text-[15px] font-bold"
          style={{
            background: ready || !connected ? GRAD_BTN : "#DDDDE1",
            color: ready || !connected ? "#fff" : "#9A9AA3",
            boxShadow: "0 14px 30px -14px rgba(79,70,229,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {!connected
            ? "Connect wallet to create"
            : isSending
              ? "Confirming..."
              : "Create market"}
        </button>
      </div>
    </div>
  );
}
