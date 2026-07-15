"use client";

import { useMemo, useState } from "react";
import { lamports as sol, type Lamports } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "./lib/wallet/context";
import { useSolanaClient } from "./lib/solana-client-context";
import { useCluster } from "./components/cluster-context";
import { useMarkets } from "./lib/hooks/use-markets";
import { useNow } from "./lib/hooks/use-now";
import { getMarketStatus, type MarketStatus } from "./lib/market-view";
import { lamportsToSolString } from "./lib/lamports";
import { GRAD_HERO, GRAD_GLASS } from "./lib/theme";
import { Header } from "./components/header";
import { MarketTile } from "./components/markets/market-tile";

type Filter = "all" | MarketStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "awaiting", label: "Awaiting" },
  { key: "resolved", label: "Resolved" },
];

function chipStyle(active: boolean): React.CSSProperties {
  return active
    ? { background: GRAD_GLASS, color: "#2a2140", borderColor: "rgba(255,255,255,0.7)" }
    : { background: "rgba(255,255,255,0.55)", color: "#3E3E46", borderColor: "rgba(23,23,27,0.12)" };
}

export default function Home() {
  const { wallet, status: walletStatus } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  const client = useSolanaClient();
  const { markets, isLoading } = useMarkets();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");

  const walletAddress = wallet?.account.address;

  const withStatus = useMemo(
    () =>
      markets.map((entry) => ({
        ...entry,
        marketStatus: getMarketStatus(entry.market, now),
      })),
    [markets, now]
  );

  const counts = useMemo(() => {
    const c = { all: withStatus.length, open: 0, awaiting: 0, resolved: 0 };
    for (const m of withStatus) c[m.marketStatus]++;
    return c;
  }, [withStatus]);

  const totalVolume = useMemo(
    () =>
      withStatus.reduce(
        (sum, m) => sum + m.market.yesPool + m.market.noPool,
        0n
      ),
    [withStatus]
  );

  const filtered =
    filter === "all"
      ? withStatus
      : withStatus.filter((m) => m.marketStatus === filter);

  const sorted = [...filtered].sort((a, b) => {
    const rank = { open: 0, awaiting: 1, resolved: 2 };
    if (rank[a.marketStatus] !== rank[b.marketStatus]) {
      return rank[a.marketStatus] - rank[b.marketStatus];
    }
    return Number(b.market.yesPool + b.market.noPool) -
      Number(a.market.yesPool + a.market.noPool);
  });

  const handleAirdrop = async () => {
    if (!walletAddress) return;
    try {
      toast.info("Requesting airdrop...");
      const sig = await client.airdrop(walletAddress, sol(1_000_000_000n));
      toast.success("Airdrop received!", {
        description: sig ? (
          <a
            href={getExplorerUrl(`/tx/${sig}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction
          </a>
        ) : undefined,
      });
    } catch (err) {
      console.error("Airdrop failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimited =
        msg.includes("429") || msg.includes("Internal JSON-RPC error");
      toast.error(
        isRateLimited
          ? "Devnet faucet rate-limited. Use the web faucet instead."
          : "Airdrop failed. Try again later."
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-7 py-[34px] pb-[90px]">
        {walletStatus !== "connected" && (
          <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white px-[18px] py-[13px]" style={{ borderColor: "rgba(23,23,27,0.1)" }}>
            <p className="text-[13.5px] text-[#3E3E46]">
              You&apos;re browsing as a guest.{" "}
              <span className="text-[#6E6E78]">
                Connect a wallet to place bets or open a market.
              </span>
            </p>
          </div>
        )}
        {walletStatus === "connected" && cluster !== "mainnet" && (
          <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white px-[18px] py-[13px]" style={{ borderColor: "rgba(23,23,27,0.1)" }}>
            <p className="text-[13.5px] text-[#3E3E46]">
              Need SOL to bet or create a market on {cluster}?
            </p>
            <button
              onClick={handleAirdrop}
              className="hover-btn-glass h-[34px] whitespace-nowrap rounded-[9px] border border-[rgba(255,255,255,0.65)] px-[15px] text-[13px] font-semibold text-[#2a2140] backdrop-blur-[11px]"
              style={{ background: GRAD_GLASS }}
            >
              Airdrop 1 SOL
            </button>
          </div>
        )}

        {/* Hero */}
        <div
          className="relative mb-5 overflow-hidden rounded-[22px] border p-[30px] pb-7"
          style={{
            background: GRAD_HERO,
            borderColor: "rgba(255,255,255,0.5)",
            boxShadow: "0 20px 46px -26px rgba(124,58,237,0.34)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(680px 260px at 88% -34%, rgba(255,255,255,0.55), transparent 62%)",
            }}
          />
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              right: -30,
              top: "50%",
              width: 240,
              height: 240,
              transform: "translateY(-50%)",
              background:
                "radial-gradient(circle at 34% 28%,rgba(255,255,255,0.95),rgba(199,183,253,0.8) 36%,rgba(131,191,247,0.62) 66%,rgba(140,236,181,0.55) 100%)",
              boxShadow:
                "0 34px 70px -22px rgba(124,58,237,0.55), inset 0 -22px 44px -12px rgba(80,60,160,0.28), inset 0 14px 34px -8px rgba(255,255,255,0.95)",
            }}
          />
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              right: 150,
              top: 26,
              width: 70,
              height: 70,
              background:
                "radial-gradient(circle at 36% 30%,rgba(255,255,255,0.95),rgba(251,182,206,0.7) 60%,rgba(244,120,150,0.5) 100%)",
              boxShadow:
                "0 16px 34px -12px rgba(229,85,106,0.5), inset 0 8px 18px -6px rgba(255,255,255,0.9)",
            }}
          />

          <div className="relative">
            <div className="mb-[11px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(41,32,74,0.6)]">
              On-chain prediction markets
            </div>
            <h1 className="m-0 text-[36px] font-bold tracking-[-0.035em] text-[#241a3a]">
              Back your conviction.
            </h1>
            <p className="mb-[22px] mt-2.5 max-w-[470px] text-[14.5px] leading-[1.5] text-[rgba(36,26,58,0.72)]">
              Every binary market lives on-chain. Bet SOL on YES or NO &mdash;
              winners split the losing pool, proportional to their stake.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <div className="rounded-xl border px-[17px] py-2.5" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.7)" }}>
                <div className="font-mono text-xl font-semibold text-[#241a3a]">
                  ◎ {lamportsToSolString(totalVolume as Lamports)}
                </div>
                <div className="mt-0.5 text-[11px] text-[rgba(36,26,58,0.6)]">
                  total volume
                </div>
              </div>
              <div className="rounded-xl border px-[17px] py-2.5" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.7)" }}>
                <div className="font-mono text-xl font-semibold text-[#241a3a]">
                  {counts.open}
                </div>
                <div className="mt-0.5 text-[11px] text-[rgba(36,26,58,0.6)]">
                  live markets
                </div>
              </div>
              <div className="rounded-xl border px-[17px] py-2.5" style={{ background: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.7)" }}>
                <div className="font-mono text-xl font-semibold text-[#241a3a]">
                  {counts.resolved}
                </div>
                <div className="mt-0.5 text-[11px] text-[rgba(36,26,58,0.6)]">
                  resolved
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[19px] font-bold tracking-[-0.02em] text-[#17171B]">
            All markets
          </div>
          <div className="flex flex-wrap gap-[7px]">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="hover-chip h-9 rounded-[9px] border px-3.5 text-[13px] font-semibold backdrop-blur-sm"
                style={chipStyle(filter === f.key)}
              >
                {f.label}{" "}
                <span className="font-mono text-[11px] opacity-70">
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {isLoading && sorted.length === 0 && (
          <div className="rounded-2xl border border-[rgba(23,23,27,0.1)] bg-white p-10 text-center text-sm text-[#6E6E78]">
            Loading markets&hellip;
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div className="rounded-2xl border border-[rgba(23,23,27,0.1)] bg-white p-10 text-center text-sm text-[#6E6E78]">
            No markets{filter !== "all" ? ` in ${filter}` : ""} yet.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(330px,1fr))]">
          {sorted.map(({ address, market }) => (
            <MarketTile
              key={address}
              address={address}
              market={market}
              now={now}
              walletAddress={walletAddress}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
