"use client";

import { useWallet } from "../../lib/wallet/context";
import { GRAD_GLASS, GLASS_CARD, GLASS_CARD_SHADOW } from "../../lib/theme";

export function ConnectToBetPanel() {
  const { connectors, connect, status } = useWallet();

  return (
    <div
      className="rounded-[22px] border p-6 text-center backdrop-blur-2xl"
      style={{
        background: GLASS_CARD,
        borderColor: "rgba(255,255,255,0.85)",
        boxShadow: GLASS_CARD_SHADOW,
      }}
    >
      <div className="mb-1.5 text-[15px] font-bold text-[#17171B]">
        Betting is live
      </div>
      <p className="mb-[18px] text-[13px] leading-[1.5] text-[#6E6E78]">
        Connect a Solana wallet to take a side on this market.
      </p>
      {connectors.length <= 1 ? (
        <button
          onClick={() => connectors[0] && connect(connectors[0].id)}
          disabled={status === "connecting" || connectors.length === 0}
          className="hover-btn-glass h-12 w-full rounded-xl border text-[14.5px] font-bold text-[#2a2140] backdrop-blur-[11px] disabled:opacity-50"
          style={{ borderColor: "rgba(255,255,255,0.65)", background: GRAD_GLASS }}
        >
          {connectors.length === 0 ? "No wallet detected" : "Connect wallet"}
        </button>
      ) : (
        <div className="space-y-1.5">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect(connector.id)}
              disabled={status === "connecting"}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[rgba(23,23,27,0.14)] bg-white px-4 py-3 text-sm font-semibold text-[#17171B] transition hover:bg-[#F7F6F3] disabled:opacity-50"
            >
              {connector.icon && (
                <img src={connector.icon} alt="" className="h-5 w-5 rounded" />
              )}
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
