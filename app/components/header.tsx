"use client";

import Link from "next/link";
import { ClusterSelect } from "./cluster-select";
import { WalletButton } from "./wallet-button";
import { GRAD_BTN } from "../lib/theme";

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b px-7 backdrop-blur-2xl backdrop-saturate-[1.7]"
      style={{
        height: 66,
        background: "rgba(255,255,255,0.5)",
        borderBottomColor: "rgba(255,255,255,0.55)",
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-[11px] bg-transparent p-0 hover:no-underline"
      >
        <span
          className="flex items-center justify-center rounded-[7px]"
          style={{
            width: 26,
            height: 26,
            background: GRAD_BTN,
            transform: "rotate(45deg)",
            boxShadow: "0 3px 10px -3px rgba(79,70,229,0.7)",
          }}
        >
          <span
            className="bg-white"
            style={{ width: 9, height: 9, borderRadius: 2, transform: "rotate(-45deg)" }}
          />
        </span>
        <span className="text-[19px] font-bold tracking-[-0.02em] text-[#17171B]">
          Verdict
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        <ClusterSelect />
        <Link
          href="/create"
          className="hover-btn-ghost inline-flex h-10 items-center gap-[7px] rounded-[10px] px-4 text-[13.5px] font-semibold text-[#17171B] backdrop-blur-[11px]"
          style={{
            border: "1px solid rgba(23,23,27,0.14)",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <span className="-mt-px text-base leading-none">+</span> New market
        </Link>
        <WalletButton />
      </div>
    </header>
  );
}
