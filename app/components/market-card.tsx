"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "../lib/wallet/context";
import { useSendTransaction } from "../lib/hooks/use-send-transaction";
import { useMarket } from "../lib/hooks/use-market";
import { useUserPosition } from "../lib/hooks/use-user-position";
import { lamportsFromSol, lamportsToSolString } from "../lib/lamports";
import { type Address, type Lamports } from "@solana/kit";
import { toast } from "sonner";
import {
  findMarketPda,
  findUserPositionPda,
  getCreateMarketInstructionAsync,
  getPlaceBetInstructionAsync,
  getResolveMarketInstruction,
  getClaimWinningsInstructionAsync,
} from "../generated/prediction_market";
import { parseTransactionError } from "../lib/errors";
import { useCluster } from "./cluster-context";
import { ellipsify } from "../lib/explorer";

const MARKET_ID = 0n;

export function MarketCard() {
  const { wallet, signer, status } = useWallet();
  const { send, isSending } = useSendTransaction();
  const { getExplorerUrl } = useCluster();

  const walletAddress = wallet?.account.address;

  const [marketAddress, setMarketAddress] = useState<Address | null>(null);
  const [question, setQuestion] = useState("");
  const [resolutionDateTime, setResolutionDateTime] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [betYes, setBetYes] = useState(true);

  // Derive this wallet's market PDA (one demo market per creator)
  useEffect(() => {
    let cancelled = false;

    async function deriveMarket() {
      if (!walletAddress) {
        setMarketAddress(null);
        return;
      }
      const [pda] = await findMarketPda({
        creator: walletAddress,
        marketId: MARKET_ID,
      });
      if (!cancelled) setMarketAddress(pda);
    }

    void deriveMarket();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const { market, mutate: mutateMarket } = useMarket(marketAddress ?? undefined);

  const [userPositionAddress, setUserPositionAddress] =
    useState<Address | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function derivePosition() {
      if (!marketAddress || !walletAddress) {
        setUserPositionAddress(null);
        return;
      }
      const [pda] = await findUserPositionPda({
        market: marketAddress,
        user: walletAddress,
      });
      if (!cancelled) setUserPositionAddress(pda);
    }

    void derivePosition();
    return () => {
      cancelled = true;
    };
  }, [marketAddress, walletAddress]);

  const { position, mutate: mutatePosition } = useUserPosition(
    userPositionAddress ?? undefined
  );

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const resolutionTimeMs = market ? Number(market.resolutionTime) * 1000 : 0;
  const bettingClosed = market ? now >= resolutionTimeMs : false;
  const isCreator = market && walletAddress ? market.creator === walletAddress : false;
  const outcome = market?.outcome ?? null;

  const winningAmount = useMemo(() => {
    if (!position || outcome === null) return 0n;
    return outcome ? position.yesAmount : position.noAmount;
  }, [position, outcome]);

  const handleCreateMarket = useCallback(async () => {
    if (!signer || !question.trim() || !resolutionDateTime) return;

    const resolutionTime = BigInt(
      Math.floor(new Date(resolutionDateTime).getTime() / 1000)
    );

    try {
      const instruction = await getCreateMarketInstructionAsync({
        creator: signer,
        marketId: MARKET_ID,
        question: question.trim(),
        resolutionTime,
      });

      const signature = await send({ instructions: [instruction] });

      toast.success("Market created!", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${signature}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      setQuestion("");
      setResolutionDateTime("");
      await mutateMarket();
    } catch (err) {
      console.error("Create market failed:", err);
      toast.error(parseTransactionError(err));
    }
  }, [signer, question, resolutionDateTime, send, getExplorerUrl, mutateMarket]);

  const handlePlaceBet = useCallback(async () => {
    if (!signer || !marketAddress || !betAmount) return;

    const amount = lamportsFromSol(parseFloat(betAmount));
    if (amount <= 0n) return;

    try {
      const instruction = await getPlaceBetInstructionAsync({
        user: signer,
        market: marketAddress,
        amount,
        betYes,
      });

      const signature = await send({ instructions: [instruction] });

      toast.success("Bet placed!", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${signature}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      setBetAmount("");
      await Promise.all([mutateMarket(), mutatePosition()]);
    } catch (err) {
      console.error("Place bet failed:", err);
      toast.error(parseTransactionError(err));
    }
  }, [
    signer,
    marketAddress,
    betAmount,
    betYes,
    send,
    getExplorerUrl,
    mutateMarket,
    mutatePosition,
  ]);

  const handleResolve = useCallback(
    async (winningOutcome: boolean) => {
      if (!signer || !marketAddress) return;

      try {
        const instruction = getResolveMarketInstruction({
          creator: signer,
          market: marketAddress,
          outcome: winningOutcome,
        });

        const signature = await send({ instructions: [instruction] });

        toast.success("Market resolved!", {
          description: (
            <a
              href={getExplorerUrl(`/tx/${signature}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          ),
        });
        await mutateMarket();
      } catch (err) {
        console.error("Resolve market failed:", err);
        toast.error(parseTransactionError(err));
      }
    },
    [signer, marketAddress, send, getExplorerUrl, mutateMarket]
  );

  const handleClaim = useCallback(async () => {
    if (!signer || !marketAddress) return;

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
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      await Promise.all([mutateMarket(), mutatePosition()]);
    } catch (err) {
      console.error("Claim winnings failed:", err);
      toast.error(parseTransactionError(err));
    }
  }, [signer, marketAddress, send, getExplorerUrl, mutateMarket, mutatePosition]);

  if (status !== "connected") {
    return (
      <section className="w-full space-y-4 rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]">
        <div className="space-y-1">
          <p className="text-lg font-semibold">Prediction Market</p>
          <p className="text-sm text-muted">
            Connect your wallet to interact with the prediction market
            program.
          </p>
        </div>
        <div className="rounded-lg bg-cream/50 p-4 text-center text-sm text-muted">
          Wallet not connected
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-4 rounded-2xl border border-border-low bg-card p-6 shadow-[0_20px_80px_-50px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-lg font-semibold">Prediction Market</p>
          <p className="text-sm text-muted">
            Create a YES/NO market, bet SOL, resolve, and claim winnings.
          </p>
        </div>
        {market && (
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80">
            {market.resolved
              ? "Resolved"
              : bettingClosed
                ? "Awaiting resolution"
                : "Open"}
          </span>
        )}
      </div>

      {!market && (
        <div className="space-y-3">
          <textarea
            placeholder="Will it rain tomorrow?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            disabled={isSending}
            rows={2}
            className="w-full resize-none rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-foreground/30 disabled:opacity-50 disabled:pointer-events-none"
          />
          <div className="flex gap-3">
            <input
              type="datetime-local"
              value={resolutionDateTime}
              onChange={(e) => setResolutionDateTime(e.target.value)}
              disabled={isSending}
              className="flex-1 rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm outline-none transition focus:border-foreground/30 disabled:opacity-50 disabled:pointer-events-none"
            />
            <button
              onClick={handleCreateMarket}
              disabled={isSending || !question.trim() || !resolutionDateTime}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending ? "Confirming..." : "Create Market"}
            </button>
          </div>
        </div>
      )}

      {market && (
        <>
          {/* Market question + pools */}
          <div className="rounded-xl border border-border-low bg-cream/30 p-4">
            <p className="text-sm font-medium">{market.question}</p>
            <p className="mt-1 text-xs text-muted">
              Resolves {new Date(resolutionTimeMs).toLocaleString()}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Yes Pool
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {lamportsToSolString(market.yesPool as Lamports)}{" "}
                  <span className="text-sm font-normal text-muted">SOL</span>
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  No Pool
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {lamportsToSolString(market.noPool as Lamports)}{" "}
                  <span className="text-sm font-normal text-muted">SOL</span>
                </p>
              </div>
            </div>
            {market.resolved && (
              <p className="mt-3 text-sm font-medium">
                Outcome:{" "}
                <span className={outcome ? "text-green-600" : "text-red-600"}>
                  {outcome ? "YES" : "NO"}
                </span>
              </p>
            )}
            <p className="mt-3 flex items-center gap-1.5">
              <a
                href={getExplorerUrl(`/address/${marketAddress}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-xs text-muted underline underline-offset-2"
              >
                {marketAddress ? ellipsify(marketAddress, 4) : ""}
              </a>
            </p>
          </div>

          {/* Your position */}
          {position && (
            <div className="rounded-xl border border-border-low bg-cream/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Your Position
              </p>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <p className="text-sm">
                  YES: {lamportsToSolString(position.yesAmount as Lamports)}{" "}
                  SOL
                </p>
                <p className="text-sm">
                  NO: {lamportsToSolString(position.noAmount as Lamports)} SOL
                </p>
              </div>
              {position.claimed && (
                <p className="mt-2 text-xs text-muted">Winnings claimed.</p>
              )}
            </div>
          )}

          {/* Bet form */}
          {!market.resolved && !bettingClosed && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setBetYes(true)}
                  disabled={isSending}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none ${
                    betYes
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border-low bg-card hover:bg-cream"
                  }`}
                >
                  Bet YES
                </button>
                <button
                  onClick={() => setBetYes(false)}
                  disabled={isSending}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none ${
                    !betYes
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border-low bg-card hover:bg-cream"
                  }`}
                >
                  Bet NO
                </button>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount in SOL"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={isSending}
                  className="flex-1 rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-foreground/30 disabled:opacity-50 disabled:pointer-events-none"
                />
                <button
                  onClick={handlePlaceBet}
                  disabled={
                    isSending || !betAmount || parseFloat(betAmount) <= 0
                  }
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSending ? "Confirming..." : "Place Bet"}
                </button>
              </div>
            </div>
          )}

          {/* Resolve (creator only, after resolution time) */}
          {!market.resolved && bettingClosed && isCreator && (
            <div className="space-y-2">
              <p className="text-xs text-muted">
                Betting has closed. Resolve the market with the winning
                outcome.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve(true)}
                  disabled={isSending}
                  className="flex-1 rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition hover:bg-cream disabled:opacity-50 disabled:pointer-events-none"
                >
                  Resolve YES
                </button>
                <button
                  onClick={() => handleResolve(false)}
                  disabled={isSending}
                  className="flex-1 rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition hover:bg-cream disabled:opacity-50 disabled:pointer-events-none"
                >
                  Resolve NO
                </button>
              </div>
            </div>
          )}

          {!market.resolved && bettingClosed && !isCreator && (
            <p className="text-xs text-muted">
              Betting has closed. Waiting for the market creator to resolve.
            </p>
          )}

          {/* Claim winnings */}
          {market.resolved && position && !position.claimed && (
            <button
              onClick={handleClaim}
              disabled={isSending || winningAmount <= 0n}
              className="w-full rounded-lg border border-border-low bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition hover:bg-cream disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending
                ? "Confirming..."
                : winningAmount > 0n
                  ? "Claim Winnings"
                  : "No Winnings to Claim"}
            </button>
          )}
        </>
      )}

      {/* Educational Footer */}
      <div className="border-t border-border-low pt-4 text-xs text-muted">
        <p className="mb-2">
          This prediction market is an{" "}
          <a
            href="https://www.anchor-lang.com/docs"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2"
          >
            Anchor program
          </a>{" "}
          deployed on devnet. Want to deploy your own?
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.anchor-lang.com/docs/quickstart"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 font-medium transition hover:bg-cream/70"
          >
            Anchor Quickstart
          </a>
          <a
            href="https://solana.com/docs/programs/deploying"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-1 font-medium transition hover:bg-cream/70"
          >
            Deploy Programs
          </a>
        </div>
      </div>
    </section>
  );
}
