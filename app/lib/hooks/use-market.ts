"use client";

import useSWR from "swr";
import { type Address } from "@solana/kit";
import { fetchMaybeMarket, type Market } from "../../generated/prediction_market";
import { useCluster } from "../../components/cluster-context";
import { useSolanaClient } from "../solana-client-context";

export function useMarket(address?: Address) {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR(
    address ? (["market", cluster, address] as const) : null,
    async ([, , addr]) => {
      const account = await fetchMaybeMarket(client.rpc, addr);
      return account.exists ? account.data : null;
    },
    { refreshInterval: 15_000, revalidateOnFocus: true }
  );

  return {
    market: (data ?? null) as Market | null,
    isLoading,
    error,
    mutate,
  };
}
