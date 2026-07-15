"use client";

import useSWR from "swr";
import { type Address } from "@solana/kit";
import {
  fetchMaybeUserPosition,
  type UserPosition,
} from "../../generated/prediction_market";
import { useCluster } from "../../components/cluster-context";
import { useSolanaClient } from "../solana-client-context";

export function useUserPosition(address?: Address) {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR(
    address ? (["user-position", cluster, address] as const) : null,
    async ([, , addr]) => {
      const account = await fetchMaybeUserPosition(client.rpc, addr);
      return account.exists ? account.data : null;
    },
    { refreshInterval: 15_000, revalidateOnFocus: true }
  );

  return {
    position: (data ?? null) as UserPosition | null,
    isLoading,
    error,
    mutate,
  };
}
