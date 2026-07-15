"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { PropsWithChildren } from "react";
import { ClusterProvider } from "./cluster-context";
import { WalletProvider } from "../lib/wallet/context";
import { SolanaClientProvider } from "../lib/solana-client-context";

function SuccessIcon() {
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#3A56E8]/[0.22] text-[13px] text-[#3A56E8]">
      &#10003;
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#E5556A]/[0.22] text-[13px] text-[#E5556A]">
      &#10007;
    </span>
  );
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light">
      <ClusterProvider>
        <SolanaClientProvider>
          <WalletProvider>{children}</WalletProvider>
        </SolanaClientProvider>
        <Toaster
          position="bottom-right"
          closeButton
          icons={{ success: <SuccessIcon />, error: <ErrorIcon /> }}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex items-start gap-2.5 rounded-[13px] bg-[#17171B] px-[15px] py-3.5 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.5)] max-w-[360px] w-full",
              title: "text-[13.5px] font-semibold leading-snug text-white",
              description:
                "mt-1 font-mono text-[11px] text-white/60 [&_a]:underline [&_a:hover]:text-white",
              closeButton:
                "!left-auto !right-0 !top-0 !translate-x-0 !translate-y-0 !static !bg-transparent !border-0 !text-white/40 hover:!text-white",
            },
          }}
        />
      </ClusterProvider>
    </ThemeProvider>
  );
}
