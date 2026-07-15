"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "../lib/wallet/context";
import { useBalance } from "../lib/hooks/use-balance";
import { lamportsToSolString } from "../lib/lamports";
import { ellipsify } from "../lib/explorer";
import { useCluster } from "./cluster-context";
import { GRAD_GLASS } from "../lib/theme";

export function WalletButton() {
  const { connectors, connect, disconnect, wallet, status, error } =
    useWallet();

  const { getExplorerUrl } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const address = wallet?.account.address;
  const balance = useBalance(address);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status !== "connected") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => (isOpen ? close() : open())}
          className="hover-btn-glass h-10 rounded-[10px] border border-[rgba(255,255,255,0.65)] px-[18px] text-[13.5px] font-semibold text-[#2a2140] backdrop-blur-[11px]"
          style={{
            background: GRAD_GLASS,
            boxShadow: "0 8px 22px -12px rgba(124,58,237,0.4)",
          }}
        >
          Connect wallet
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[rgba(23,23,27,0.12)] bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-medium text-muted">
              Choose a wallet
            </p>
            <div className="space-y-1">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={async () => {
                    try {
                      await connect(connector.id);
                      close();
                    } catch {
                      // connection errors are surfaced through context state
                    }
                  }}
                  disabled={status === "connecting"}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-cream disabled:opacity-50 disabled:pointer-events-none"
                >
                  {connector.icon && (
                    <img
                      src={connector.icon}
                      alt=""
                      className="h-5 w-5 rounded"
                    />
                  )}
                  <span>{connector.name}</span>
                </button>
              ))}
            </div>
            {status === "connecting" && (
              <p className="mt-2 text-xs text-muted">Connecting...</p>
            )}
            {error != null && (
              <p className="mt-2 text-xs text-destructive">
                {error instanceof Error ? error.message : String(error)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (isOpen ? close() : open())}
        className="flex h-10 items-center gap-2 rounded-[10px] border border-[rgba(23,23,27,0.14)] bg-white px-[13px] font-mono text-[13px] font-semibold text-[#17171B]"
      >
        <span className="h-[7px] w-[7px] rounded-full bg-[#2FA36B]" />
        {ellipsify(address!, 4)}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[rgba(23,23,27,0.12)] bg-white p-4 shadow-lg">
          <div className="mb-3">
            <p className="text-xs text-muted">Balance</p>
            <p className="text-lg font-bold tabular-nums">
              {balance.lamports != null
                ? lamportsToSolString(balance.lamports)
                : "\u2014"}{" "}
              <span className="text-sm font-normal text-muted">SOL</span>
            </p>
          </div>

          <div className="mb-3 rounded-lg border border-border-low bg-cream/50 px-3 py-2">
            <p className="break-all font-mono text-xs">{address}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 cursor-pointer rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium transition hover:bg-cream"
            >
              {copied ? "Copied!" : "Copy address"}
            </button>
            <a
              href={getExplorerUrl(`/address/${address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-border-low bg-card px-3 py-2 text-center text-xs font-medium transition hover:bg-cream"
            >
              Explorer
            </a>
          </div>

          <button
            onClick={() => {
              disconnect();
              close();
            }}
            className="mt-2 w-full cursor-pointer rounded-lg border border-border-low bg-card px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
