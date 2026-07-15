"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Address } from "@solana/kit";
import { Header } from "../../components/header";
import { StatusBadge } from "../../components/markets/status-badge";
import { OddsPanel } from "../../components/markets/odds-panel";
import { ResolvedBanner } from "../../components/markets/resolved-banner";
import { PositionPanel } from "../../components/markets/position-panel";
import { BetPanel } from "../../components/markets/bet-panel";
import { ConnectToBetPanel } from "../../components/markets/connect-to-bet-panel";
import { ResolvePanel } from "../../components/markets/resolve-panel";
import { ClaimPanel } from "../../components/markets/claim-panel";
import { useWallet } from "../../lib/wallet/context";
import { useMarket } from "../../lib/hooks/use-market";
import { useUserPosition } from "../../lib/hooks/use-user-position";
import { useNow } from "../../lib/hooks/use-now";
import { getMarketStatus, getOutcome } from "../../lib/market-view";
import { findUserPositionPda } from "../../generated/prediction_market";

export default function MarketDetailPage() {
  const params = useParams<{ address: string }>();
  const marketAddress = params.address as Address;

  const { wallet } = useWallet();
  const walletAddress = wallet?.account.address;
  const now = useNow();

  const { market, mutate: mutateMarket } = useMarket(marketAddress);

  const [positionAddress, setPositionAddress] = useState<Address | null>(
    null
  );
  useEffect(() => {
    let cancelled = false;
    async function derive() {
      if (!walletAddress) {
        setPositionAddress(null);
        return;
      }
      const [pda] = await findUserPositionPda({
        market: marketAddress,
        user: walletAddress,
      });
      if (!cancelled) setPositionAddress(pda);
    }
    void derive();
    return () => {
      cancelled = true;
    };
  }, [marketAddress, walletAddress]);

  const { position, mutate: mutatePosition } = useUserPosition(
    positionAddress ?? undefined
  );

  const refresh = () => {
    void mutateMarket();
    void mutatePosition();
  };

  if (!market) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-7 py-[34px] pb-[90px]">
          <div className="rounded-2xl border border-[rgba(23,23,27,0.1)] bg-white p-10 text-center text-sm text-[#6E6E78]">
            Loading market&hellip;
          </div>
        </main>
      </div>
    );
  }

  const status = getMarketStatus(market, now);
  const outcome = getOutcome(market);
  const isCreator = walletAddress != null && market.creator === walletAddress;
  const hasPosition =
    position != null && (position.yesAmount > 0n || position.noAmount > 0n);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-7 py-[34px] pb-[90px]">
        <Link
          href="/"
          className="hover-link-dark mb-[18px] inline-flex items-center gap-[7px] text-[13.5px] font-medium text-[#6E6E78]"
        >
          &larr; All markets
        </Link>

        <div className="mb-3">
          <StatusBadge status={status} outcome={outcome} size="lg" />
        </div>
        <h1
          className="mb-[22px] max-w-[820px] font-bold text-[#17171B]"
          style={{ fontSize: 29, lineHeight: 1.22, letterSpacing: "-0.025em" }}
        >
          {market.question}
        </h1>

        <div className="flex flex-wrap items-start gap-[22px]">
          <div className="flex min-w-[330px] flex-[2] flex-col gap-4">
            <OddsPanel market={market} now={now} />

            {status === "resolved" && outcome != null && (
              <ResolvedBanner
                outcome={outcome}
                resolutionTime={market.resolutionTime}
              />
            )}

            {hasPosition && (
              <PositionPanel
                position={position!}
                status={status}
                outcome={outcome}
              />
            )}
          </div>

          <div className="sticky top-[88px] min-w-[290px] flex-1">
            {status === "open" &&
              (wallet ? (
                <BetPanel marketAddress={marketAddress} onSuccess={refresh} />
              ) : (
                <ConnectToBetPanel />
              ))}

            {status === "awaiting" && (
              <ResolvePanel
                marketAddress={marketAddress}
                isCreator={isCreator}
                onSuccess={refresh}
              />
            )}

            {status === "resolved" && (
              <ClaimPanel
                marketAddress={marketAddress}
                market={market}
                position={position}
                onSuccess={refresh}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
