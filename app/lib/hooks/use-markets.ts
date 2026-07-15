"use client";

import useSWR from "swr";
import {
  getBase58Decoder,
  getBase64Encoder,
  type Address,
  type Base58EncodedBytes,
} from "@solana/kit";
import {
  MARKET_DISCRIMINATOR,
  decodeMarket,
  PREDICTION_MARKET_PROGRAM_ADDRESS,
  type Market,
} from "../../generated/prediction_market";
import { useCluster } from "../../components/cluster-context";
import { useSolanaClient } from "../solana-client-context";

export type MarketEntry = {
  address: Address;
  market: Market;
};

const DISCRIMINATOR_BASE58 = getBase58Decoder().decode(
  MARKET_DISCRIMINATOR
) as Base58EncodedBytes;

export function useMarkets() {
  const { cluster } = useCluster();
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR(
    ["markets", cluster] as const,
    async () => {
      const accounts = await client.rpc
        .getProgramAccounts(PREDICTION_MARKET_PROGRAM_ADDRESS, {
          encoding: "base64",
          withContext: false,
          filters: [
            {
              memcmp: {
                offset: 0n,
                bytes: DISCRIMINATOR_BASE58,
                encoding: "base58",
              },
            },
          ],
        })
        .send();

      const entries: MarketEntry[] = accounts.map(({ pubkey, account }) => {
        const decoded = decodeMarket({
          address: pubkey,
          data: getBase64Encoder().encode(account.data[0]),
          executable: account.executable,
          lamports: account.lamports,
          programAddress: account.owner,
          space: account.space,
        });
        return { address: pubkey, market: decoded.data };
      });

      return entries;
    },
    { refreshInterval: 20_000, revalidateOnFocus: true }
  );

  return {
    markets: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
