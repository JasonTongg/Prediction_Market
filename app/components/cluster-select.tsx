"use client";

export function ClusterSelect() {
  return (
    <div
      className="flex h-[30px] items-center gap-1.5 rounded-lg px-2.5 font-mono text-[12px] font-semibold"
      style={{
        background: "rgba(14,159,110,0.10)",
        border: "1px solid rgba(14,159,110,0.28)",
        color: "#0A7A54",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "#0E9F6E", animation: "vpulse 2s infinite" }}
      />
      Devnet
    </div>
  );
}
